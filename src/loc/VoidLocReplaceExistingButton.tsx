import { useCallback, useState, useMemo, useEffect } from "react";
import { Form } from "react-bootstrap";
import { OpenLoc, ClosedLoc, ClosedCollectionLoc } from "@logion/client";
import { UUID } from "@logion/node-api";

import Button from "../common/Button";
import { useCommonContext } from "../common/CommonContext";
import DangerDialog from "../common/DangerDialog";
import FormGroup from "../common/FormGroup";
import Icon from "../common/Icon";
import ExtrinsicSubmissionStateView from "../ExtrinsicSubmissionStateView";
import { useLocContext } from "./LocContext";
import { useLogionChain, CallCallback } from "src/logion-chain";

export default function VoidLocReplaceExistingButton() {
    const { colorTheme } = useCommonContext();
    const { api, signer, submitCall, clearSubmissionState, extrinsicSubmissionState } = useLogionChain();
    const [ visible, setVisible ] = useState(false);
    const { loc: locData, mutateLocState } = useLocContext();
    const [ reason, setReason ] = useState<string>("");
    const [ replacerLocId, setReplacerLocId ] = useState<string>("");
    const [ replacerLocIdError, setReplacerLocIdError ] = useState<string | undefined>(undefined);

    const call = useMemo(() => {
        return async (callback: CallCallback) => {
            const locId = UUID.fromDecimalString(replacerLocId);
            if (!locId) {
                setReplacerLocIdError("Invalid LOC ID");
            } else {
                if (replacerLocId === locData?.id.toDecimalString()) {
                    setReplacerLocIdError("Cannot be replaced by itself");
                } else {
                    const replacerLoc = await api!.queries.getLegalOfficerCase(locId);
                    if (!replacerLoc) {
                        setReplacerLocIdError("LOC not found on chain");
                    } else if (replacerLoc.voidInfo !== undefined) {
                        setReplacerLocIdError("Cannot be replaced by a VOID LOC");
                    } else if (replacerLoc.locType !== locData?.locType) {
                        setReplacerLocIdError(`Cannot be replaced by a LOC of type: ${ replacerLoc.locType }`);
                    } else {
                        setReplacerLocIdError(undefined);
                        await mutateLocState(async current => {
                            if (signer && (current instanceof OpenLoc || current instanceof ClosedLoc || current instanceof ClosedCollectionLoc)) {
                                return current.legalOfficer.voidLoc({
                                    reason,
                                    replacer: locId,
                                    signer,
                                    callback,
                                });
                            } else {
                                return current;
                            }
                        });
                    }
                }
            }
        }
    }, [ replacerLocId, api, reason, locData, mutateLocState, signer ]);

    const clearAndClose = useCallback(() => {
        clearSubmissionState();
        setReason("");
        setReplacerLocId("");
        setReplacerLocIdError(undefined);
        setVisible(false);
    }, [ clearSubmissionState, setReason, setReplacerLocId, setReplacerLocIdError, setVisible ]);

    useEffect(() => {
        if (extrinsicSubmissionState.isSuccessful()) {
            clearAndClose();
        }
    }, [ extrinsicSubmissionState, clearAndClose]);

    if(locData === null) {
        return null;
    }

    return (
        <>
            <Button variant="danger" onClick={ () => setVisible(true) }>Void and replace by an EXISTING LOC</Button>
            <DangerDialog
                show={ visible }
                size="lg"
                actions={[
                    {
                        id: "cancel",
                        buttonText: "Cancel",
                        buttonVariant: "danger-outline",
                        callback: clearAndClose
                    },
                    {
                        id: "void",
                        buttonText: "Void and replace by an EXISTING LOC",
                        buttonVariant: "danger",
                        callback: () => submitCall(call),
                        disabled: extrinsicSubmissionState.submitted
                    }
                ]}
            >
                <Icon icon={{id: 'void'}} width="31px" />
                <h2>Void this LOC and replace it by an EXISTING LOC</h2>
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
                    id="existingLocId"
                    label="Existing LOC ID"
                    control={ <Form.Control
                        type="text"
                        value={ replacerLocId }
                        onChange={ (event) => { setReplacerLocIdError(undefined) ; setReplacerLocId(event.target.value) } }
                        isInvalid={ replacerLocIdError !== undefined }
                    /> }
                    colors={ colorTheme.dialog }
                    feedback={ replacerLocIdError }
                />
                {
                    <ExtrinsicSubmissionStateView
                        successMessage="LOC successfully voided"
                    />
                }
            </DangerDialog>
        </>
    );
}
