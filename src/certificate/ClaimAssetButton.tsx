import { BlockchainTypes, CrossmintEVMWalletAdapter } from "@crossmint/embed";
import { Token, LogionClient, CollectionItem, TokenType } from "@logion/client";
import { CrossmintSigner } from "@logion/crossmint";
import { allMetamaskAccounts, enableMetaMask } from "@logion/extension";
import { UUID } from "@logion/node-api";
import { AxiosInstance } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Dropdown, Spinner } from "react-bootstrap";

import Button from "../common/Button";
import ViewFileButton from "../common/ViewFileButton";
import { checkCanGetCollectionFile, checkCanGetCollectionItemFile, getCollectionFile, getCollectionItemFile, GetCollectionItemFileParameters, TypedFile } from "../loc/FileModel";
import { useLogionChain } from "../logion-chain";
import Icon from "src/common/Icon";
import config from "src/config";
import { LogionChainContextType } from "src/logion-chain/LogionChainContext";
import Dialog from "src/common/Dialog";
import Select from "src/common/Select";
import Alert from "src/common/Alert";

import './ClaimAssetButton.css';

export type WalletType = "METAMASK" | "CROSSMINT" | "POLKADOT";

const ALL_WALLET_TYPES: WalletType[] = ["CROSSMINT", "METAMASK", "POLKADOT"];

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

export function walletType(type: string | null | undefined): WalletType | undefined | null {
    if(type === "CROSSMINT" || type === "METAMASK" || type === "POLKADOT") {
        return type;
    } else {
        return undefined;
    }
}

export type ClaimedFileType = "Collection" | "Item";

export interface ClaimedFile {
    name: string;
    hash: string;
    type: ClaimedFileType;
}

export interface Props {
    locId: UUID,
    owner: string,
    item: CollectionItem,
    file: ClaimedFile,
    walletType?: WalletType | null,
}

enum ClaimWithPolkadotState {
    NONE,
    SELECT_ADDRESS,
    AUTHENTICATE,
    AUTHENTICATING,
    CLAIM,
}

export default function ClaimAssetButton(props: Props) {
    const { locId, owner, item, file } = props;
    const [ tokenForDownload, setTokenForDownload ] = useState<Token | undefined>(undefined);
    const [ isOwner, setIsOwner ] = useState<boolean>(false);
    const [ checking, setChecking ] = useState<boolean>(false);
    const [ error, setError ] = useState<string | undefined>(undefined);
    const logionChainContext = useLogionChain();
    const [ downloaded, setDownloaded ] = useState(false);
    const [ claimWithPolkadotState, setClaimWithPolkadotState ] = useState(ClaimWithPolkadotState.NONE);

    const claimAsset = useCallback(async (walletType: WalletType) => {
        if(walletType !== "POLKADOT") {
            setError(undefined);
            setChecking(true);
            try {
                const token = await getToken(walletType, logionChainContext);
                setTokenForDownload(token);
                const axios = logionChainContext.axiosFactory!(owner);
                if(token && await canDownload(axios, token, file.type, { locId: locId.toString(), collectionItemId: item.id, hash: file.hash })) {
                    setIsOwner(true);
                    setChecking(false);
                } else {
                    setError("Ownership check failed");
                    setChecking(false);
                }
            } catch (error) {
                setChecking(false);
                setError("" + (error as Error).message);
            }
        } else {
            setClaimWithPolkadotState(ClaimWithPolkadotState.SELECT_ADDRESS);
        }
    }, [ setTokenForDownload, logionChainContext, locId, item, file, owner ]);

    const claimWithCurrentAccount = useCallback(async () => {
        setClaimWithPolkadotState(ClaimWithPolkadotState.NONE);
        setError(undefined);
        setChecking(true);
        try {
            const axios = logionChainContext.axiosFactory!(owner);
            if(await canDownload(axios, undefined, file.type, { locId: locId.toString(), collectionItemId: item.id, hash: file.hash })) {
                setTokenForDownload(logionChainContext.accounts!.current!.token);
                setIsOwner(true);
                setChecking(false);
            } else {
                setError("Ownership check failed");
                setChecking(false);
            }
        } catch (error) {
            setChecking(false);
            setError("" + (error as Error).message);
        }
    }, [ logionChainContext, locId, item, file, owner ]);

    const tryClaimWithPolkadot = useCallback(() => {
        if(logionChainContext.isCurrentAuthenticated()) {
            claimWithCurrentAccount();
        } else {
            setClaimWithPolkadotState(ClaimWithPolkadotState.AUTHENTICATE);
        }
    }, [ logionChainContext, claimWithCurrentAccount ]);

    useEffect(() => {
        if(claimWithPolkadotState === ClaimWithPolkadotState.AUTHENTICATE) {
            setClaimWithPolkadotState(ClaimWithPolkadotState.AUTHENTICATING);
            const currentAddress = logionChainContext.accounts!.current!.address;
            logionChainContext.authenticate([ currentAddress ]);
        }
    }, [ logionChainContext, claimWithPolkadotState ]);

    useEffect(() => {
        if(claimWithPolkadotState === ClaimWithPolkadotState.AUTHENTICATING
            && logionChainContext.isCurrentAuthenticated()) {
            claimWithCurrentAccount();
        }
    }, [ logionChainContext, claimWithPolkadotState, claimWithCurrentAccount ]);

    const reset = useCallback(() => {
        setTokenForDownload(undefined);
        setError(undefined);
    }, [])

    const compatibleWallets = useMemo(() => {
        return ALL_WALLET_TYPES.filter(walletType => walletTypeCompatibleWithItemType(walletType, item.token?.type));
    }, [ item.token?.type ]);

    const walletType = props.walletType;
    const noClaimPending = !error && (item.restrictedDelivery || props.file.type === "Collection") && !checking && !isOwner;
    const downloadReady = tokenForDownload && isOwner;

    if(!item.token?.type) {
        return null;
    }

    return (
        <div className="ClaimAssetButton">
            {
                noClaimPending && walletType &&
                <Button
                    onClick={ () => claimAsset(walletType) }
                >
                    <Icon icon={{ id: "claim" }} /> { buttonText(props.file.type) }
                </Button>
            }
            {
                noClaimPending && (!walletType && compatibleWallets.length === 1) &&
                <Button
                    onClick={ () => claimAsset(compatibleWallets[0]) }
                >
                    <Icon icon={{ id: "claim" }} /> { buttonText(props.file.type) }
                </Button>
            }
            {
                noClaimPending && (!walletType && compatibleWallets.length > 1) &&
                <Dropdown>
                    <Dropdown.Toggle className="Button" id="ClaimAssetButton-dropdown-toggle"><Icon icon={{ id: "claim" }} /> <span className="claim-asset-btn-text">{ buttonText(props.file.type) }</span></Dropdown.Toggle>
                    <Dropdown.Menu>
                        {
                            compatibleWallets.map(walletType => (
                                <Dropdown.Item key={walletType} onClick={ () => claimAsset(walletType) } className={ walletType.toLowerCase() }>
                                    <Icon icon={{ id: walletType.toLowerCase() }} height="40px" type={ ICON_TYPES[walletType] } /> <span className="wallet-name">with { WALLET_NAMES[walletType] }</span>
                                </Dropdown.Item>
                            ))
                        }
                    </Dropdown.Menu>
                </Dropdown>
            }
            {
                !error && checking &&
                <div className="check-ongoing">
                    <Icon icon={{ id: "ownership_check_ongoing" }} /> <Spinner animation="border" variant="polkadot" />
                </div>
            }
            {
                error !== undefined &&
                <Button
                    onClick={ reset }
                    variant="danger"
                >
                    <Icon icon={{ id: "claim" }} /> { error }
                </Button>
            }
            {
                downloadReady && !downloaded &&
                <ViewFileButton
                    nodeOwner={ owner }
                    fileName={ file.name }
                    downloader={ (axios: AxiosInstance) => {
                        setDownloaded(true);
                        overrideAuthorizationToken(axios, tokenForDownload);
                        return getClaimedFile(
                            axios,
                            file.type,
                            {
                                locId: locId.toString(),
                                collectionItemId: item.id,
                                hash: file.hash,
                            }
                        )
                    }}
                    limitIconSize={ false }
                >
                    <Icon icon={{ id: "download_claimed" }} /> Download
                </ViewFileButton>
            }
            {
                downloadReady && downloaded &&
                <span className="download-started">Download started</span>
            }
            {
                claimWithPolkadotState === ClaimWithPolkadotState.SELECT_ADDRESS &&
                <Dialog
                    size="lg"
                    show={ true }
                    actions={[
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
                    ]}
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
                            options={logionChainContext.accounts?.all.map(account => ({
                                label: account.name,
                                value: account.address,
                            })) || []}
                            onChange={ value => logionChainContext.selectAddress!(value || "") }
                            value={ logionChainContext.accounts?.current?.address || null }
                        />
                    }
                </Dialog>
            }
        </div>
    )
}

async function getToken(walletType: WalletType, context: LogionChainContextType): Promise<Token> {
    if(walletType === "CROSSMINT") {
        if(!context.client) {
            throw new Error("No Logion client available");
        }
        return authenticateWithCrossmint(context.client);
    } else if(walletType === "METAMASK") {
        return authenticateWithMetamask(context);
    } else {
        throw new Error(`Unsupported wallet type ${walletType}`);
    }
}

async function authenticateWithCrossmint(client: LogionClient): Promise<Token> {
    const crossmint = new CrossmintEVMWalletAdapter({
        apiKey: config.crossmintApiKey,
        chain: BlockchainTypes.ETHEREUM,
    });
  
    const address = await crossmint.connect();
    if(!address) {
        throw new Error("Unable to connect to Crossmint");
    }
    console.log(`Detected Crossmint address ${address}`);

    const signer = new CrossmintSigner(crossmint);
    let authenticatedClient = await client.authenticate([ address ], signer);
    const token = authenticatedClient.tokens.get(address);
    if(!token) {
        throw new Error("Unable to authenticate");
    }
    return token;
}

let metaMaskEnabled = false;

async function authenticateWithMetamask(context: LogionChainContextType): Promise<Token> {
    if (!metaMaskEnabled) {
        metaMaskEnabled = await enableMetaMask(config.APP_NAME);
        if(!metaMaskEnabled) {
            throw new Error("Could not enable Metamask");
        }
    }

    const accounts = await allMetamaskAccounts();
    accounts.forEach(account => console.log("Detected MetaMask accounts: %s", account.address));

    if (accounts.length > 0) {
        const metaMaskAddress = accounts[0].address;
        const token = await context.authenticateAddress(metaMaskAddress);
        if(!token) {
            throw new Error("Unable to authenticate");
        }
        return token;
    } else {
        throw new Error("No MetaMask account available");
    }
}

function overrideAuthorizationToken(axios: AxiosInstance, tokenForDownload: Token) {
    axios.interceptors.request.use((config) => {
        if(!config.headers) {
            config.headers = {};
        }
        config.headers['Authorization'] = `Bearer ${tokenForDownload.value}`;
        return config;
    });
}

async function canDownload(axios: AxiosInstance, tokenForDownload: Token | undefined, fileType: ClaimedFileType, parameters: GetCollectionItemFileParameters): Promise<boolean> {
    if(tokenForDownload) {
        overrideAuthorizationToken(axios, tokenForDownload);
    }
    if(fileType === "Item") {
        return checkCanGetCollectionItemFile(axios, parameters);
    } else {
        return checkCanGetCollectionFile(axios, parameters);
    }
}

async function getClaimedFile(
    axios: AxiosInstance,
    fileType: ClaimedFileType,
    parameters: GetCollectionItemFileParameters
): Promise<TypedFile> {
    if(fileType === "Item") {
        return getCollectionItemFile(axios, parameters);
    } else {
        return getCollectionFile(axios, parameters);
    }
}

function walletTypeCompatibleWithItemType(wallet: WalletType, token?: TokenType): boolean {
    if(!token) {
        return false;
    }

    if(['ethereum_erc721', 'ethereum_erc1155', 'goerli_erc721', 'goerli_erc1155', 'owner'].includes(token)) {
        return ["METAMASK", "CROSSMINT"].includes(wallet);
    } else if(['singular_kusama', 'owner'].includes(token)) {
        return wallet === "POLKADOT";
    } else {
        return false;
    }
}

function buttonText(fileType: ClaimedFileType) {
    if(fileType === "Item") {
        return "Claim your asset";
    } else {
        return "Claim document";
    }
}
