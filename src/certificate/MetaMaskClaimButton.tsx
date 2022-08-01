import { MergedCollectionItem } from "../common/types/ModelTypes";
import Button from "../common/Button";
import { useCallback, useState } from "react";
import { enableMetaMask, allMetamaskAccounts } from "@logion/extension";
import config from "../config";
import Dialog from "../common/Dialog";
import { ItemFile } from "@logion/node-api/dist/Types";
import { UUID } from "@logion/node-api/dist/UUID";
import ViewFileButton from "../common/ViewFileButton";
import { AxiosInstance } from "axios";
import { getCollectionItemFile } from "../loc/FileModel";
import { useLogionChain } from "../logion-chain";
import { Token } from "@logion/client";

export interface Props {
    locId: UUID,
    owner: string,
    item: MergedCollectionItem,
    file: ItemFile,
}

export default function MetaMaskClaimButton(props: Props) {

    const { locId, owner, item, file } = props;
    const [ metaMaskEnabled, setMetaMaskEnabled ] = useState<boolean | undefined>(undefined);
    const [ metaMaskAddress, setMetaMaskAddress ] = useState<string | undefined>(undefined);
    const [ tokenForDownload, setTokenForDownload ] = useState<Token | undefined>(undefined);
    const [ error, setError ] = useState<string | undefined>(undefined);
    const { authenticateAddress } = useLogionChain();

    const selectMetaMaskAccount = useCallback(async () => {
        let enabled = metaMaskEnabled;
        if (enabled === undefined) {
            enabled = await enableMetaMask(config.APP_NAME)
            setMetaMaskEnabled(enabled)
        }
        if (enabled) {
            const accounts = await allMetamaskAccounts();
            accounts.forEach(account => console.log("Detected MetaMask accounts: %s", account.address));
            if (accounts.length > 0) {
                setMetaMaskAddress(accounts[0].address)
            }
        } else {
            setError("MetaMask not installed, or user did not connect an account")
        }
    }, [ metaMaskEnabled ])

    const authenticateWithMetaMask = useCallback(async () => {
        setError(undefined);
        try {
            setTokenForDownload(await authenticateAddress(metaMaskAddress!))
        } catch (error) {
            setError("" + (error as Error).message)
        }
    }, [ authenticateAddress, metaMaskAddress ])

    const reset = useCallback(() => {
        setMetaMaskEnabled(undefined);
        setMetaMaskAddress(undefined);
        setTokenForDownload(undefined);
        setError(undefined);
    }, [])

    return (
        <>
            { item.restrictedDelivery &&
                <Button
                    onClick={ selectMetaMaskAccount }>
                    Claim
                </Button>
            }
            <Dialog
                actions={ [
                    {
                        id: "cancel",
                        buttonText: "Cancel",
                        buttonVariant: 'secondary',
                        callback: reset,
                    },
                    {
                        id: "sign",
                        buttonText: "Sign",
                        buttonVariant: 'primary',
                        disabled: tokenForDownload !== undefined,
                        callback: authenticateWithMetaMask,
                    }
                ] }
                show={ metaMaskAddress !== undefined || error !== undefined }
                size={ "lg" }>
                <p>
                    <>
                        In order to claim your certified copy of <br />
                        «<strong>{ file.name }</strong>» ({ file.contentType }, { file.size.toString() } bytes),<br />
                        you must first sign with your Ethereum address { metaMaskAddress }
                    </>
                </p>
                { tokenForDownload !== undefined &&
                    <>
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
                        >
                            Download
                        </ViewFileButton>
                    </>
                }
                { error !== undefined &&
                    <p>
                        Error: { error }
                    </p>
                }
            </Dialog>
        </>
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
