import { useCallback, useState, useMemo } from "react";
import { Form } from "react-bootstrap";
import { OpenLoc, ClosedLoc, ClosedCollectionLoc } from "@logion/client";

import Button from "../common/Button";
import { useCommonContext } from "../common/CommonContext";
import DangerDialog from "../common/DangerDialog";
import FormGroup from "../common/FormGroup";
import Icon from "../common/Icon";
import { useLocContext } from "./LocContext";
import ExtrinsicSubmissionStateView from "../ExtrinsicSubmissionStateView";
import { useLogionChain, CallCallback } from "src/logion-chain";

export default function VoidLocButton() {
    const { colorTheme } = useCommonContext();
    const [ visible, setVisible ] = useState(false);
    const { mutateLocState, loc: locData } = useLocContext();
    const { signer, submitCall, clearSubmissionState, extrinsicSubmissionState } = useLogionChain();
    const [ reason, setReason ] = useState<string>("");

    const call = useMemo(() => {
        return async (callback: CallCallback) =>
            mutateLocState(async current => {
                if (signer && (current instanceof OpenLoc || current instanceof ClosedLoc || current instanceof ClosedCollectionLoc)) {
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
        clearSubmissionState();
        setReason("");
        setVisible(false);
    }, [ clearSubmissionState ]);

    const submit = useCallback(async () => {
        try {
            await submitCall(call);
            if (extrinsicSubmissionState.isSuccessful()) {
                clearAndClose();
            }
        } catch (e) {
            console.error(e);
        }
    }, [ submitCall, call, extrinsicSubmissionState, clearAndClose ]);

    return (
        <>
            <Button variant="danger" onClick={ () => setVisible(true) }>Void LOC</Button>
            <DangerDialog
                show={ visible }
                size="lg"
                actions={[
                    {
                        id: "close",
                        buttonText: "Close",
                        buttonVariant: "danger-outline",
                        callback: clearAndClose,
                        disabled: extrinsicSubmissionState.submitted && !extrinsicSubmissionState.callEnded
                    },
                    {
                        id: "void",
                        buttonText: "Void LOC",
                        buttonVariant: "danger",
                        callback: submit,
                        disabled: extrinsicSubmissionState.submitted
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
                <ExtrinsicSubmissionStateView
                    successMessage="LOC successfully voided"
                />
            </DangerDialog>
        </>
    );
}
