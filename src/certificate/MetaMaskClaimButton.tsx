import { MergedCollectionItem } from "../common/types/ModelTypes";
import Button from "../common/Button";
import { useCallback, useState } from "react";
import { enableMetaMask, allMetamaskAccounts } from "@logion/extension";
import config from "../config";
import { ItemFile } from "@logion/node-api/dist/Types";
import { UUID } from "@logion/node-api/dist/UUID";
import ViewFileButton from "../common/ViewFileButton";
import { AxiosInstance } from "axios";
import { checkCanGetCollectionItemFile, getCollectionItemFile, GetCollectionItemFileParameters } from "../loc/FileModel";
import { useLogionChain } from "../logion-chain";
import { Token } from "@logion/client";
import Icon from "src/common/Icon";
import { Spinner } from "react-bootstrap";

import './MetaMaskClaimButton.css';

export interface Props {
    locId: UUID,
    owner: string,
    item: MergedCollectionItem,
    file: ItemFile,
}

export default function MetaMaskClaimButton(props: Props) {

    const { locId, owner, item, file } = props;
    const [ metaMaskEnabled, setMetaMaskEnabled ] = useState<boolean | undefined>(undefined);
    const [ tokenForDownload, setTokenForDownload ] = useState<Token | undefined>(undefined);
    const [ isOwner, setIsOwner ] = useState<boolean>(false);
    const [ checking, setChecking ] = useState<boolean>(false);
    const [ error, setError ] = useState<string | undefined>(undefined);
    const { authenticateAddress, axiosFactory } = useLogionChain();

    const claimAsset = useCallback(async () => {
        setError(undefined);
        setChecking(true);
        let enabled = metaMaskEnabled;
        if (enabled === undefined) {
            enabled = await enableMetaMask(config.APP_NAME)
            setMetaMaskEnabled(enabled)
        }
        if (enabled) {
            const accounts = await allMetamaskAccounts();
            accounts.forEach(account => console.log("Detected MetaMask accounts: %s", account.address));
            if (accounts.length > 0) {
                const metaMaskAddress = accounts[0].address;
                try {
                    const token = await authenticateAddress(metaMaskAddress);
                    setTokenForDownload(token);
                    const axios = axiosFactory!(owner);
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
            } else {
                setChecking(false);
                setError("No MetaMask account available");
            }
        } else {
            setChecking(false);
            setError("MetaMask not installed, or user did not connect an account");
        }
    }, [ metaMaskEnabled, setTokenForDownload, authenticateAddress, axiosFactory, locId, item, file, owner ]);

    const reset = useCallback(() => {
        setMetaMaskEnabled(undefined);
        setTokenForDownload(undefined);
        setError(undefined);
    }, [])

    return (
        <div className="MetaMaskClaimButton">
            {
                !error && item.restrictedDelivery && !checking && !isOwner &&
                <Button
                    onClick={ claimAsset }
                >
                    <Icon icon={{ id: "claim" }} /> Claim your asset
                </Button>
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
                tokenForDownload && isOwner &&
                <ViewFileButton
                    nodeOwner={ owner }
                    fileName={ file.name }
                    downloader={ (axios: AxiosInstance) => {
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
        </div>
    )
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
