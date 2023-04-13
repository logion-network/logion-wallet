import { useCallback, useState } from "react";
import { Form } from "react-bootstrap";
import { LocRequest } from "@logion/client";
import { UUID } from "@logion/node-api";

import Button from "../common/Button";
import { useCommonContext } from "../common/CommonContext";
import DangerDialog from "../common/DangerDialog";
import FormGroup from "../common/FormGroup";
import Icon from "../common/Icon";
import { createLocRequest, CreateLocRequest } from "../common/Model";
import { useLegalOfficerContext } from "../legal-officer/LegalOfficerContext";
import { useLocContext } from "./LocContext";
import LocCreationSteps from "./LocCreationSteps";
import { useLogionChain } from "../logion-chain";
import ClientExtrinsicSubmitter, { Call, CallCallback } from "src/ClientExtrinsicSubmitter";
import { voidLoc, FullVoidInfo } from "src/legal-officer/client";

export default function VoidLocReplaceNewButton() {
    const { accounts, signer } = useLogionChain();
    const { colorTheme } = useCommonContext();
    const { axios } = useLegalOfficerContext();
    const [ visible, setVisible ] = useState(false);
    const { loc: locData, mutateLocState } = useLocContext();
    const [ call, setCall ] = useState<Call>();
    const [ submissionFailed, setSubmissionFailed ] = useState<boolean>(false);
    const [ reason, setReason ] = useState<string>("");
    const [ newLocDescription, setNewLocDescription ] = useState<string>("");
    const [ newLocRequest, setNewLocRequest ] = useState<LocRequest | null>(null);

    const voidLocCallback = useCallback((callback: CallCallback, voidInfo: FullVoidInfo) => {
        return mutateLocState(async current => {
            if(signer) {
                return voidLoc({
                    locState: current,
                    voidInfo,
                    signer,
                    callback,
                });
            } else {
                return current;
            }
        });
    }, [ signer, mutateLocState ]);

    const createNewLocRequest = useCallback(() => {
        (async function () {
            const currentAddress = accounts!.current!.accountId;
            const request: CreateLocRequest = {
                ownerAddress: currentAddress.address,
                requesterAddress: locData?.requesterAddress ? locData.requesterAddress : undefined,
                requesterIdentityLoc: locData?.requesterLocId ? locData.requesterLocId.toString() : undefined,
                description: newLocDescription,
                userIdentity: locData!.userIdentity,
                locType: locData!.locType,
            }
            setNewLocRequest(await createLocRequest!(axios!, request));
        })();
    }, [ axios, accounts, locData, newLocDescription ]);

    const clearAndClose = useCallback(() => {
        setReason("");
        setCall(undefined);
        setSubmissionFailed(false);
        setVisible(false)
    }, [  ]);

    if(locData === null) {
        return null;
    }

    return (
        <>
            <Button variant="danger" onClick={ () => setVisible(true) }>Void and replace by a NEW LOC</Button>
            <DangerDialog
                show={ visible }
                size="lg"
                actions={[
                    {
                        id: "cancel",
                        buttonText: "Cancel",
                        buttonVariant: "danger-outline",
                        callback: clearAndClose,
                        disabled: call !== undefined && !submissionFailed
                    },
                    {
                        id: "void",
                        buttonText: "Void and replace by a NEW LOC",
                        buttonVariant: "danger",
                        callback: createNewLocRequest,
                        disabled: newLocRequest !== null || call !== undefined
                    }
                ]}
            >
                <Icon icon={{id: 'void'}} width="31px" />
                <h2>Void this LOC and replace it by a NEW LOC, you create now</h2>
                <p>This action will invalidate the present LOC: the LOC status, its public certificate will show a "VOID" mention to warn people that
                    the content of the LOC is not valid anymore. As you are about to set a replacing LOC, people will be automatically redirected to
                    the replacing LOC when accessing to the void LOC URL and a mention of the fact that the replacing LOC supersedes the void LOC will
                    be shared on both public certificates.
                </p>
                <p>As Legal Officer, you will still have access to the LOC, its data and confidential content.</p>
                <p><strong>PLEASE USE CAREFULLY, THIS ACTION CANNOT BE REVERTED.</strong></p>
                <FormGroup
                    id="reason"
                    label="Reason"
                    control={ <Form.Control
                        type="text"
                        value={ reason }
                        onChange={ (event) => setReason(event.target.value) }
                    /> }
                    colors={ colorTheme.dialog }
                />
                <FormGroup
                    id="newLocDescription"
                    label="New LOC Description"
                    control={ <Form.Control
                        type="text"
                        value={ newLocDescription }
                        onChange={ (event) => setNewLocDescription(event.target.value) }
                    /> }
                    colors={ colorTheme.dialog }
                />
                {
                    newLocRequest !== null &&
                    <LocCreationSteps
                        requestToCreate={ newLocRequest }
                        exit={ () => { setNewLocRequest(null); } }
                        onSuccess={ () => {
                            const voidInfo = {
                                reason,
                                replacer: new UUID(newLocRequest.id)
                            };
                            setNewLocRequest(null);
                            setCall(() => (callback: CallCallback) => voidLocCallback(callback, voidInfo));
                        } }
                    />
                }
                {
                    call !== undefined &&
                    <ClientExtrinsicSubmitter
                        call={ call }
                        successMessage="LOC successfully voided"
                        onSuccess={ () => setVisible(false) }
                        onError={ () => setSubmissionFailed(true) }
                    />
                }
            </DangerDialog>
        </>
    );
}
