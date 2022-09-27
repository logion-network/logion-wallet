import { BlockchainTypes, CrossmintEVMWalletAdapter } from "@crossmint/embed";
import { Token, LogionClient, MergedCollectionItem } from "@logion/client";
import { CrossmintSigner } from "@logion/crossmint";
import { allMetamaskAccounts, enableMetaMask } from "@logion/extension";
import { ItemFile, UUID } from "@logion/node-api";
import { AxiosInstance } from "axios";
import { useCallback, useState } from "react";
import { Dropdown, Spinner } from "react-bootstrap";

import Button from "../common/Button";
import ViewFileButton from "../common/ViewFileButton";
import { checkCanGetCollectionItemFile, getCollectionItemFile, GetCollectionItemFileParameters } from "../loc/FileModel";
import { useLogionChain } from "../logion-chain";
import Icon from "src/common/Icon";
import config from "src/config";
import { LogionChainContextType } from "src/logion-chain/LogionChainContext";

import './ClaimAssetButton.css';

export type WalletType = "METAMASK" | "CROSSMINT";

export interface Props {
    locId: UUID,
    owner: string,
    item: MergedCollectionItem,
    file: ItemFile,
    walletType?: WalletType | null,
}

export default function ClaimAssetButton(props: Props) {
    const { locId, owner, item, file } = props;
    const [ tokenForDownload, setTokenForDownload ] = useState<Token | undefined>(undefined);
    const [ isOwner, setIsOwner ] = useState<boolean>(false);
    const [ checking, setChecking ] = useState<boolean>(false);
    const [ error, setError ] = useState<string | undefined>(undefined);
    const logionChainContext = useLogionChain();
    const [ downloaded, setDownloaded ] = useState(false);

    const claimAsset = useCallback(async (walletType: WalletType) => {
        setError(undefined);
        setChecking(true);
        try {
            const token = await getToken(walletType, logionChainContext);
            setTokenForDownload(token);
            const axios = logionChainContext.axiosFactory!(owner);
            if(token && await canDownload(axios, token, { locId: locId.toString(), collectionItemId: item.id, hash: file.hash })) {
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
    }, [ setTokenForDownload, logionChainContext, locId, item, file, owner ]);

    const reset = useCallback(() => {
        setTokenForDownload(undefined);
        setError(undefined);
    }, [])

    const walletType = props.walletType;
    const noClaimPending = !error && item.restrictedDelivery && !checking && !isOwner;
    const downloadReady = tokenForDownload && isOwner;

    return (
        <div className="ClaimAssetButton">
            {
                noClaimPending && walletType &&
                <Button
                    onClick={ () => claimAsset(walletType) }
                >
                    <Icon icon={{ id: "claim" }} /> Claim your asset
                </Button>
            }
            {
                noClaimPending && !walletType &&
                <Dropdown>
                    <Dropdown.Toggle className="Button" id="ClaimAssetButton-dropdown-toggle"><Icon icon={{ id: "claim" }} /> <span className="claim-asset-btn-text">Claim your asset</span></Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={ () => claimAsset("METAMASK") } className="metamask">
                        <Icon icon={{ id: "metamask" }} height="40px" /> <span className="wallet-name">with Metamask</span>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={ () => claimAsset("CROSSMINT") } className="crossmint">
                        <Icon icon={{ id: "crossmint" }} height="40px" type="png" /> <span className="wallet-name">with Crossmint</span>
                        </Dropdown.Item>
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
                        return getCollectionItemFile(axios, {
                            locId: locId.toString(),
                            collectionItemId: item.id,
                            hash: file.hash,
                        })
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

async function canDownload(axios: AxiosInstance, tokenForDownload: Token, parameters: GetCollectionItemFileParameters): Promise<boolean> {
    overrideAuthorizationToken(axios, tokenForDownload);
    return checkCanGetCollectionItemFile(axios, parameters);
}
