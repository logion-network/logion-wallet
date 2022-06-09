import { useCallback, useState } from "react";
import { Form } from "react-bootstrap";
import Button from "../common/Button";
import { useCommonContext } from "../common/CommonContext";
import DangerDialog from "../common/DangerDialog";
import FormGroup from "../common/FormGroup";
import Icon from "../common/Icon";
import ExtrinsicSubmitter, { SignAndSubmit } from "../ExtrinsicSubmitter";
import { FullVoidInfo, useLocContext } from "./LocContext";
import { useLegalOfficerContext } from "../legal-officer/LegalOfficerContext";

export default function VoidLocButton() {
    const { colorTheme, refresh } = useCommonContext();
    const [ visible, setVisible ] = useState(false);
    const { voidLocExtrinsic, voidLoc, loc } = useLocContext();
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ submissionFailed, setSubmissionFailed ] = useState<boolean>(false);
    const [ voidInfo, setVoidInfo ] = useState<FullVoidInfo>({reason: ""});
    const { refreshLocs } = useLegalOfficerContext();

    const clearAndClose = useCallback(() => {
        setVoidInfo({reason: ""});
        setSignAndSubmit(null);
        setSubmissionFailed(false);
        setVisible(false)
    }, [ setVoidInfo, setSignAndSubmit, setSubmissionFailed, setVisible ]);

    return (
        <>
            <Button variant="danger" onClick={ () => setVisible(true) }>Void LOC</Button>
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
                        buttonText: "Void LOC",
                        buttonVariant: "danger",
                        callback: () => { setSubmissionFailed(false); setSignAndSubmit(() => voidLocExtrinsic!(voidInfo)) },
                        disabled: signAndSubmit !== null
                    }
                ]}
            >
                <Icon icon={{id: 'void'}} width="31px" />
                {
                    loc?.locType !== 'Collection' &&
                    <>
                        <h2>Void this LOC</h2>
                        <p>This action will invalidate the present LOC: the LOC status, its public certificate will show a "VOID" mention to warn people that
                            the content of the LOC is not valid anymore.
                        </p>
                        <p>As Legal Officer, you will still have access to the LOC, its data and confidential content.</p>
                        <p><strong>PLEASE USE CAREFULLY, THIS ACTION CANNOT BE REVERTED.</strong></p>
                    </>
                }
                {
                    loc?.locType === 'Collection' &&
                    <>
                        <h2>Void this Collection LOC</h2>
                        <p>This action will invalidate the present Collection LOC as well as ALL related Collection Items:
                            the <strong>Collection LOC and each related Collection Items</strong> status / public certificate will show a "VOID"
                            mention to warn people that the content of the Collection LOC <strong>and all related Collection Items</strong> are not valid anymore.
                        </p>
                        <p>After this VOID operation, as a Legal Officer, you will still have access to the VOID Collection LOC data and confidential
                            content as well as all VOID Collection Items data.</p>
                        <p><strong>PLEASE USE CAREFULLY, THIS ACTION CANNOT BE REVERTED.</strong></p>
                    </>
                }
                <FormGroup
                    id="reason"
                    label="Reason"
                    control={ <Form.Control
                        type="text"
                        value={ voidInfo.reason }
                        onChange={ (event) => setVoidInfo({reason: event.target.value}) }
                    /> }
                    colors={ colorTheme.dialog }
                />
                {
                    signAndSubmit !== null &&
                    <ExtrinsicSubmitter
                        id="voidLocSubmitter"
                        signAndSubmit={ signAndSubmit }
                        successMessage="LOC successfully voided"
                        onSuccess={ () => {
                            setVisible(false);
                            voidLoc!(voidInfo);
                            refresh!(false);
                            refreshLocs();
                        } }
                        onError={ () => setSubmissionFailed(true) }
                    />
                }
            </DangerDialog>
        </>
    );
}
