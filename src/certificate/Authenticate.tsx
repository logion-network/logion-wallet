import { BlockchainTypes, CrossmintEVMWalletAdapter } from "@crossmint/connect";
import { Token, LogionClient, CollectionItem, TokenType, isTokenCompatibleWith } from "@logion/client";
import { CrossmintSigner } from "@logion/crossmint";
import { allMetamaskAccounts, enableMetaMask } from "@logion/extension";
import { AnyAccountId } from "@logion/node-api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Dropdown, Spinner } from "react-bootstrap";
import Button from "../common/Button";
import { useLogionChain } from "../logion-chain";
import Icon from "src/common/Icon";
import config from "src/config";
import { LogionChainContextType } from "src/logion-chain/LogionChainContext";
import Dialog from "src/common/Dialog";
import Select from "src/common/Select";
import Alert from "src/common/Alert";
import { UUID } from "@logion/node-api";
import ButtonGroup from 'src/common/ButtonGroup';
import Clickable from "src/common/Clickable";
import './Authenticate.css';

type WalletType = "METAMASK" | "CROSSMINT" | "POLKADOT";

const ALL_WALLET_TYPES: WalletType[] = [ "CROSSMINT", "METAMASK", "POLKADOT" ];

const WALLET_NAMES: Record<WalletType, string> = {
    METAMASK: "Metamask",
    CROSSMINT: "Crossmint",
    POLKADOT: "Polkadot",
};

const ICON_TYPES: Record<WalletType, "svg" | "png"> = {
    METAMASK: "svg",
    CROSSMINT: "png",
    POLKADOT: "svg",
};

function toWalletType(type: string | null | undefined): WalletType | undefined {
    if (type === "CROSSMINT" || type === "METAMASK" || type === "POLKADOT") {
        return type;
    } else {
        return undefined;
    }
}

export interface Props {
    locId: UUID,
    item: CollectionItem,
    walletType: string | null,
    setTokenForDownload: (token: Token | undefined) => void,
}

enum ClaimWithPolkadotState {
    NONE,
    SELECT_ADDRESS,
    AUTHENTICATE,
    AUTHENTICATING,
}

type Status = 'IDLE' | 'CHECKING' | 'OWNER_OK' | 'OWNER_KO';

export default function Authenticate(props: Props) {
    const { locId, item, setTokenForDownload } = props;
    const [ error, setError ] = useState<string | undefined>(undefined);
    const logionChainContext = useLogionChain();
    const [ claimWithPolkadotState, setClaimWithPolkadotState ] = useState(ClaimWithPolkadotState.NONE);
    const [ status, setStatus ] = useState<Status>('IDLE');

    const checkOwnership = useCallback(async (client: LogionClient) => {
        const newItem = await client.public.findCollectionLocItemById({ locId, itemId: item.id});
        const isOwner = newItem && await newItem.isAuthenticatedTokenOwner();
        if (isOwner) {
            setTokenForDownload(client.tokens.get(client.currentAddress));
            setStatus('OWNER_OK');
        } else {
            setStatus('OWNER_KO');
            setError("The address you used does not own a token bind to this certificate.");
        }
    }, [ item, locId, setTokenForDownload ]);

    const claimAsset = useCallback(async (walletType: WalletType) => {
        setTokenForDownload(undefined);
        if (walletType !== "POLKADOT") {
            setError(undefined);
            setStatus('CHECKING')
            try {
                const client = await getClient(walletType, logionChainContext);
                await checkOwnership(client);
            } catch (error) {
                setStatus('OWNER_KO');
                setError("" + (error as Error).message);
            }
        } else {
            setClaimWithPolkadotState(ClaimWithPolkadotState.SELECT_ADDRESS);
        }
    }, [ setTokenForDownload, checkOwnership, logionChainContext ]);

    const claimWithCurrentAccount = useCallback(async () => {
        setClaimWithPolkadotState(ClaimWithPolkadotState.NONE);
        setError(undefined);
        setStatus('CHECKING');
        try {
            const client = logionChainContext.client;
            await checkOwnership(client!);
        } catch (error) {
            setStatus('OWNER_KO');
            setError("" + (error as Error).message);
        }
    }, [ checkOwnership, logionChainContext ]);

    const tryClaimWithPolkadot = useCallback(() => {
        if (logionChainContext.isCurrentAuthenticated()) {
            claimWithCurrentAccount();
        } else {
            setClaimWithPolkadotState(ClaimWithPolkadotState.AUTHENTICATE);
        }
    }, [ logionChainContext, claimWithCurrentAccount ]);

    useEffect(() => {
        if (claimWithPolkadotState === ClaimWithPolkadotState.AUTHENTICATE) {
            setClaimWithPolkadotState(ClaimWithPolkadotState.AUTHENTICATING);
            const currentAddress = logionChainContext.accounts!.current!.accountId;
            logionChainContext.authenticate([ currentAddress ]);
        }
    }, [ logionChainContext, claimWithPolkadotState ]);

    useEffect(() => {
        if (claimWithPolkadotState === ClaimWithPolkadotState.AUTHENTICATING
            && logionChainContext.isCurrentAuthenticated()) {
            claimWithCurrentAccount();
        }
    }, [ logionChainContext, claimWithPolkadotState, claimWithCurrentAccount ]);

    const reset = useCallback(() => {
        setTokenForDownload(undefined);
        setError(undefined);
        setStatus('IDLE');
    }, [ setTokenForDownload ])

    const compatibleWallets = useMemo(() => {
        return ALL_WALLET_TYPES.filter(walletType => item === undefined || walletTypeCompatibleWithItemType(walletType, item.token?.type));
    }, [ item ]);

    const walletType: WalletType | undefined = toWalletType(props.walletType);

    return (
        <div className="Authenticate">
            <h3>Token-gated certificate</h3>
            <p>This certificate is bound to a token and provides token-restricted access to documents and assets for the
                token owner.</p>
            {
                (status === 'IDLE' || status === 'CHECKING') &&
                <p>To get access, if you are the owner of the token recorded in this certificate, please authenticate
                    yourself with the method you used to get your token by clicking on the button below.</p>
            }
            {
                (status === 'OWNER_OK') &&
                <p id="ok-message">You own the token bond to this certificate: you are now able to download all related
                    documents and
                    assets by clicking on the claim buttons below.</p>
            }
            {
                (status === 'OWNER_KO') &&
                <>
                    <p id="ko-message">{ error ? error : "The address you used does not own a token bind to this certificate." }</p>
                    <p>Please try <Clickable onClick={ reset }>again</Clickable>.</p>
                </>
            }
            <div className="btn-group-container">
                <ButtonGroup>
                    {
                        status === 'IDLE' &&
                        <ConnectAndClaim walletType={ walletType } compatibleWallets={ compatibleWallets }
                                        claimAsset={ claimAsset } />
                    }
                    {
                        status === 'CHECKING' &&
                        <div className="check-ongoing">
                            <Icon icon={ { id: "ownership_check_ongoing" } } />
                            <Spinner animation="border" variant="polkadot" />
                        </div>
                    }
                    {
                        status === 'OWNER_KO' &&
                        <Icon icon={ { id: "ko" } } height="60px" />
                    }
                    {
                        status === 'OWNER_OK' &&
                        <Icon icon={ { id: "ok" } } height="60px" />
                    }
                    {
                        claimWithPolkadotState === ClaimWithPolkadotState.SELECT_ADDRESS &&
                        <Dialog
                            size="lg"
                            show={ true }
                            actions={ [
                                {
                                    id: "cancel",
                                    buttonText: "Cancel",
                                    buttonVariant: "secondary",
                                    callback: () => setClaimWithPolkadotState(ClaimWithPolkadotState.NONE),
                                },
                                {
                                    id: "claimWithAddress",
                                    buttonText: "Claim with selected",
                                    buttonVariant: "primary",
                                    disabled: !(logionChainContext.accounts?.current?.accountId),
                                    callback: tryClaimWithPolkadot,
                                }
                            ] }
                        >
                            <h3>Choose a Polkadot address</h3>
                            <p>In order to claim the file using Polkadot, you have to select an account.</p>
                            {
                                (logionChainContext.accounts?.all === undefined || logionChainContext.accounts.all.length === 0) &&
                                <Alert
                                    variant="warning"
                                >
                                    No Polkadot account detected, please install the extension and/or add accounts to it.
                                </Alert>
                            }
                            {
                                (logionChainContext.accounts?.all !== undefined && logionChainContext.accounts.all.length > 0) &&
                                <Select
                                    options={ logionChainContext.accounts?.all.map(account => ({
                                        label: account.name,
                                        value: account.accountId,
                                    })) || [] }
                                    onChange={ value => logionChainContext.selectAddress!(value!) }
                                    value={ logionChainContext.accounts?.current?.accountId || null }
                                />
                            }
                        </Dialog>
                    }
                </ButtonGroup>
            </div>
        </div>
    )
}

interface ConnectAndClaimProperties {
    walletType: WalletType | undefined,
    compatibleWallets: WalletType[],
    claimAsset: (walletType: WalletType) => Promise<void>
}

function ConnectAndClaim(props: ConnectAndClaimProperties) {
    const { walletType, compatibleWallets, claimAsset } = props;
    return (<>
        {
            walletType &&
            <Button
                onClick={ () => claimAsset(walletType) }
            >
                <Icon icon={ { id: "claim" } } /> { buttonText() }
            </Button>
        }
        {
            (!walletType && compatibleWallets.length === 1) &&
            <Button
                onClick={ () => claimAsset(compatibleWallets[0]) }
            >
                <Icon icon={ { id: "claim" } } /> { buttonText() }
            </Button>
        }
        {
            (!walletType && compatibleWallets.length > 1) &&
            <Dropdown>
                <Dropdown.Toggle className="Button" id="Authenticate-dropdown-toggle"><Icon
                    icon={ { id: "claim" } } /> <span
                    className="claim-asset-btn-text">{ buttonText() }</span></Dropdown.Toggle>
                <Dropdown.Menu>
                    {
                        compatibleWallets.map(walletType => (
                            <Dropdown.Item key={ walletType } onClick={ () => claimAsset(walletType) }
                                           className={ walletType.toLowerCase() }>
                                <Icon icon={ { id: walletType.toLowerCase() } } height="40px"
                                      type={ ICON_TYPES[walletType] } /> <span
                                className="wallet-name">with { WALLET_NAMES[walletType] }</span>
                            </Dropdown.Item>
                        ))
                    }
                </Dropdown.Menu>
            </Dropdown>
        }
    </>)
}

async function getClient(walletType: WalletType, context: LogionChainContextType): Promise<LogionClient> {
    if (walletType === "CROSSMINT") {
        return authenticateWithCrossmint(context);
    } else if (walletType === "METAMASK") {
        return authenticateWithMetamask(context);
    } else {
        throw new Error(`Unsupported wallet type ${ walletType }`);
    }
}

async function authenticateWithCrossmint(context: LogionChainContextType): Promise<LogionClient> {
    const crossmint = new CrossmintEVMWalletAdapter({
        apiKey: config.crossmintApiKey,
        chain: BlockchainTypes.ETHEREUM,
    });

    const address = await crossmint.connect();
    if (!address) {
        throw new Error("Unable to connect to Crossmint");
    }
    console.log(`Detected Crossmint address ${ address }`);

    const signer = new CrossmintSigner(crossmint);
    const account = new AnyAccountId(context.api!, address, "Ethereum").toValidAccountId();
    let authenticatedClient = await context.authenticateAddress(account, signer);
    if (!authenticatedClient) {
        throw new Error("Unable to authenticate");
    }
    return authenticatedClient;
}

let metaMaskEnabled = false;

async function authenticateWithMetamask(context: LogionChainContextType): Promise<LogionClient> {
    if (!metaMaskEnabled) {
        metaMaskEnabled = await enableMetaMask(config.APP_NAME);
        if (!metaMaskEnabled) {
            throw new Error("Could not enable Metamask");
        }
    }

    const accounts = await allMetamaskAccounts();
    accounts.forEach(account => console.log("Detected MetaMask accounts: %s", account.address));

    if (accounts.length > 0) {
        const metaMaskAddress = accounts[0].address;
        const account = new AnyAccountId(context.api!, metaMaskAddress, "Ethereum").toValidAccountId();
        const authenticatedClient = await context.authenticateAddress(account);
        if (!authenticatedClient) {
            throw new Error("Unable to authenticate");
        }
        return authenticatedClient;
    } else {
        throw new Error("No MetaMask account available");
    }
}

function walletTypeCompatibleWithItemType(wallet: WalletType, token?: TokenType): boolean {
    if (!token) {
        return false;
    }
    if (isTokenCompatibleWith(token, 'ETHEREUM')) {
        return [ "METAMASK", "CROSSMINT" ].includes(wallet);
    } else if (isTokenCompatibleWith(token, 'POLKADOT')) {
        return wallet === "POLKADOT";
    } else {
        return false;
    }
}

function buttonText() {
    return "Connect & claim";
}
