import { BlockchainTypes, CrossmintEVMWalletAdapter } from "@crossmint/connect";
import { Token, LogionClient, CollectionItem, TokenType } from "@logion/client";
import { CrossmintSigner } from "@logion/crossmint";
import { allMetamaskAccounts, enableMetaMask } from "@logion/extension";
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
import { isTokenOwner } from "../loc/FileModel";
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
    owner: string,
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
    const { locId, owner, item, setTokenForDownload } = props;
    const [ error, setError ] = useState<string | undefined>(undefined);
    const logionChainContext = useLogionChain();
    const [ claimWithPolkadotState, setClaimWithPolkadotState ] = useState(ClaimWithPolkadotState.NONE);
    const [ status, setStatus ] = useState<Status>('IDLE');

    const checkOwnership = useCallback(async (jwtToken: Token) => {
        const axios = logionChainContext.axiosFactory!(owner, jwtToken);
        const isOwner = await isTokenOwner(axios, {
            locId: locId.toString(),
            collectionItemId: item.id
        });
        if (isOwner) {
            setTokenForDownload(jwtToken);
            setStatus('OWNER_OK');
        } else {
            setStatus('OWNER_KO');
            setError("The address you used does not own a token bind to this certificate.");
        }
    }, [ item.id, locId, owner, setTokenForDownload, logionChainContext.axiosFactory ]);

    const claimAsset = useCallback(async (walletType: WalletType) => {
        setTokenForDownload(undefined);
        if (walletType !== "POLKADOT") {
            setError(undefined);
            setStatus('CHECKING')
            try {
                const jwtToken = await getToken(walletType, logionChainContext);
                await checkOwnership(jwtToken);
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
            const jwtToken = logionChainContext.accounts!.current!.token;
            await checkOwnership(jwtToken!);
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
            const currentAddress = logionChainContext.accounts!.current!.address;
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
                                disabled: !(logionChainContext.accounts?.current?.address),
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
                                    value: account.address,
                                })) || [] }
                                onChange={ value => logionChainContext.selectAddress!(value || "") }
                                value={ logionChainContext.accounts?.current?.address || null }
                            />
                        }
                    </Dialog>
                }
            </ButtonGroup>
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

async function getToken(walletType: WalletType, context: LogionChainContextType): Promise<Token> {
    if (walletType === "CROSSMINT") {
        if (!context.client) {
            throw new Error("No Logion client available");
        }
        return authenticateWithCrossmint(context.client);
    } else if (walletType === "METAMASK") {
        return authenticateWithMetamask(context);
    } else {
        throw new Error(`Unsupported wallet type ${ walletType }`);
    }
}

async function authenticateWithCrossmint(client: LogionClient): Promise<Token> {
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
    let authenticatedClient = await client.authenticate([ address ], signer);
    const token = authenticatedClient.tokens.get(address);
    if (!token) {
        throw new Error("Unable to authenticate");
    }
    return token;
}

let metaMaskEnabled = false;

async function authenticateWithMetamask(context: LogionChainContextType): Promise<Token> {
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
        const token = await context.authenticateAddress(metaMaskAddress);
        if (!token) {
            throw new Error("Unable to authenticate");
        }
        return token;
    } else {
        throw new Error("No MetaMask account available");
    }
}

function walletTypeCompatibleWithItemType(wallet: WalletType, token?: TokenType): boolean {
    if (!token) {
        return false;
    }

    if ([ 'ethereum_erc721', 'ethereum_erc1155', 'goerli_erc721', 'goerli_erc1155', 'owner' ].includes(token)) {
        return [ "METAMASK", "CROSSMINT" ].includes(wallet);
    } else if ([ 'singular_kusama', 'owner' ].includes(token)) {
        return wallet === "POLKADOT";
    } else {
        return false;
    }
}

function buttonText() {
    return "Connect & claim";
}
