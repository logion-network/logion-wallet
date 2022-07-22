import { MergedCollectionItem } from "../common/types/ModelTypes";
import Button from "../common/Button";
import { useCallback, useState } from "react";
import { enableMetaMask, allMetamaskAccounts } from "@logion/extension/dist/Extension";
import config from "../config";
import Dialog from "../common/Dialog";
import { ItemFile } from "@logion/node-api/dist/Types";
import { sign } from "../logion-chain/Signature";
import { DateTime } from "luxon";
import { UUID } from "@logion/node-api/dist/UUID";
import ViewFileButton from "../common/ViewFileButton";
import { AxiosInstance } from "axios";
import { getCollectionItemFile } from "../loc/FileModel";
import { useLogionChain } from "../logion-chain";

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
    const [ signature, setSignature ] = useState<string | undefined>(undefined);
    const [ error, setError ] = useState<string | undefined>(undefined);
    const { isCurrentAuthenticated } = useLogionChain()

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

    const signWithMetaMask = useCallback(async () => {
        try {
            const signature = await sign({
                signerId: metaMaskAddress!,
                resource: "collection",
                operation: "claim",
                signedOn: DateTime.now(),
                attributes: [ locId, item.id, file.hash ]
            })
            setSignature(signature)
        } catch (error) {
            setError("" + (error as Error).message)
        }
    }, [ metaMaskAddress, locId, item.id, file.hash ])

    const reset = useCallback(() => {
        setMetaMaskEnabled(undefined);
        setMetaMaskAddress(undefined);
        setSignature(undefined);
        setError(undefined);
    }, [])

    return (
        <>
            { isCurrentAuthenticated() &&
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
                        disabled: signature !== undefined,
                        callback: signWithMetaMask,
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
                { signature !== undefined &&
                    <>
                        <ViewFileButton
                            nodeOwner={ owner }
                            fileName={ file.name }
                            downloader={ (axios: AxiosInstance) => getCollectionItemFile(axios, {
                                locId: locId.toString(),
                                collectionItemId: item.id,
                                hash: file.hash,
                            }) }
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
