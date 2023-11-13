import { useCallback, useState } from "react";
import { Form } from "react-bootstrap";
import { OpenLoc, ClosedLoc, ClosedCollectionLoc } from "@logion/client";

import Button from "../common/Button";
import { useCommonContext } from "../common/CommonContext";
import DangerDialog from "../common/DangerDialog";
import FormGroup from "../common/FormGroup";
import Icon from "../common/Icon";
import { useLocContext } from "./LocContext";
import ClientExtrinsicSubmitter, { Call, CallCallback } from "src/ClientExtrinsicSubmitter";
import { useLogionChain } from "src/logion-chain";

export default function VoidLocButton() {
    const { colorTheme } = useCommonContext();
    const [ visible, setVisible ] = useState(false);
    const { mutateLocState, loc: locData } = useLocContext();
    const [ call, setCall ] = useState<Call>();
    const [ submissionFailed, setSubmissionFailed ] = useState<boolean>(false);
    const { signer } = useLogionChain();
    const [ reason, setReason ] = useState<string>("");

    const voidLocCallback = useCallback((callback: CallCallback) => {
        return mutateLocState(async current => {
            if(signer && (current instanceof OpenLoc || current instanceof ClosedLoc || current instanceof ClosedCollectionLoc)) {
                return current.legalOfficer.voidLoc({
                    reason,
                    signer,
                    callback,
                });
            } else {
                return current;
            }
        });
    }, [ signer, mutateLocState, reason ]);

    const clearAndClose = useCallback(() => {
        setCall(undefined);
        setSubmissionFailed(false);
        setVisible(false)
    }, [  ]);

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
                        disabled: call !== undefined && !submissionFailed
                    },
                    {
                        id: "void",
                        buttonText: "Void LOC",
                        buttonVariant: "danger",
                        callback: () => { setSubmissionFailed(false); setCall(() => voidLocCallback); },
                        disabled: call !== undefined
                    }
                ]}
            >
                <Icon icon={{id: 'void'}} width="31px" />
                {
                    locData?.locType !== 'Collection' &&
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
                    locData?.locType === 'Collection' &&
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
                        value={ reason }
                        onChange={ (event) => setReason(event.target.value) }
                    /> }
                    colors={ colorTheme.dialog }
                />
                <ClientExtrinsicSubmitter
                    call={ call }
                    successMessage="LOC successfully voided"
                    onSuccess={ clearAndClose }
                    onError={ () => setSubmissionFailed(true) }
                />
            </DangerDialog>
        </>
    );
}
