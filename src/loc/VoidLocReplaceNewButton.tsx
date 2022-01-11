import { useCallback, useState } from "react";
import { Form } from "react-bootstrap";
import Button from "../common/Button";
import { useCommonContext } from "../common/CommonContext";
import DangerDialog from "../common/DangerDialog";
import FormGroup from "../common/FormGroup";
import Icon from "../common/Icon";
import { createLocRequest, CreateLocRequest } from "../common/Model";
import { LocRequest } from "../common/types/ModelTypes";
import ExtrinsicSubmitter, { SignAndSubmit } from "../ExtrinsicSubmitter";
import { UUID } from "../logion-chain/UUID";
import { useLegalOfficerContext } from "../legal-officer/LegalOfficerContext";
import { FullVoidInfo, useLocContext } from "./LocContext";
import LocCreationSteps from "./LocCreationSteps";

export default function VoidLocReplaceNewButton() {
    const { colorTheme, refresh, accounts } = useCommonContext();
    const { axios } = useLegalOfficerContext();
    const [ visible, setVisible ] = useState(false);
    const { locRequest, voidLocExtrinsic, voidLoc } = useLocContext();
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ submissionFailed, setSubmissionFailed ] = useState<boolean>(false);
    const [ reason, setReason ] = useState<string>("");
    const [ newLocDescription, setNewLocDescription ] = useState<string>("");
    const [ newLocRequest, setNewLocRequest ] = useState<LocRequest | null>(null);
    const [ voidInfo, setVoidInfo ] = useState<FullVoidInfo | null>(null);

    const createNewLocRequest = useCallback(() => {
        (async function () {
            const currentAddress = accounts!.current!.address;
            const request: CreateLocRequest = {
                ownerAddress: currentAddress,
                requesterAddress: locRequest!.requesterAddress ? locRequest!.requesterAddress : undefined,
                requesterIdentityLoc: locRequest!.requesterIdentityLoc ? locRequest!.requesterIdentityLoc : undefined,
                description: newLocDescription,
                userIdentity: locRequest!.userIdentity,
                locType: locRequest!.locType,
            }
            setNewLocRequest(await createLocRequest!(axios!, request));
        })();
    }, [ axios, accounts, locRequest, newLocDescription ]);

    const clearAndClose = useCallback(() => {
        setVoidInfo({reason: ""});
        setSignAndSubmit(null);
        setSubmissionFailed(false);
        setVisible(false)
    }, [ setVoidInfo, setSignAndSubmit, setSubmissionFailed, setVisible ]);

    if(locRequest === null) {
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
                        disabled: signAndSubmit !== null && !submissionFailed
                    },
                    {
                        id: "void",
                        buttonText: "Void and replace by a NEW LOC",
                        buttonVariant: "danger",
                        callback: createNewLocRequest,
                        disabled: newLocRequest !== null || signAndSubmit !== null
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
                            setVoidInfo(voidInfo);
                            setNewLocRequest(null);
                            setSignAndSubmit(() => voidLocExtrinsic!(voidInfo));
                        } }
                    />
                }
                {
                    signAndSubmit !== null && voidInfo !== null &&
                    <ExtrinsicSubmitter
                        id="voidLocSubmitter"
                        signAndSubmit={ signAndSubmit }
                        successMessage="LOC successfully voided"
                        onSuccess={ () => {
                            setVisible(false);
                            voidLoc!(voidInfo)
                            refresh!()
                        } }
                        onError={ () => setSubmissionFailed(true) }
                    />
                }
            </DangerDialog>
        </>
    );
}
