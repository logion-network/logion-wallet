import { useCallback, useState } from "react";
import { Form } from "react-bootstrap";
import { getLegalOfficerCase } from "@logion/node-api/dist/LogionLoc";
import { UUID } from "@logion/node-api/dist/UUID";

import Button from "../common/Button";
import { useCommonContext } from "../common/CommonContext";
import DangerDialog from "../common/DangerDialog";
import FormGroup from "../common/FormGroup";
import Icon from "../common/Icon";
import ExtrinsicSubmitter, { SignAndSubmit } from "../ExtrinsicSubmitter";
import { FullVoidInfo, useLocContext } from "./LocContext";
import { useLogionChain } from "../logion-chain";

export default function VoidLocReplaceExistingButton() {
    const { colorTheme, refresh } = useCommonContext();
    const { api } = useLogionChain();
    const [ visible, setVisible ] = useState(false);
    const { locRequest, voidLocExtrinsic, voidLoc, loc } = useLocContext();
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ reason, setReason ] = useState<string>("");
    const [ replacerLocId, setReplacerLocId ] = useState<string>("");
    const [ replacerLocIdError, setReplacerLocIdError ] = useState<string | undefined>(undefined);
    const [ voidInfo, setVoidInfo ] = useState<FullVoidInfo | null>(null);

    const checkAndVoid = useCallback(async () => {
        const locId = UUID.fromDecimalString(replacerLocId);
        if (!locId) {
            setReplacerLocIdError("Invalid LOC ID");
        } else {
            if(replacerLocId === new UUID(locRequest?.id).toDecimalString()) {
                setReplacerLocIdError("Cannot be replaced by itself");
            } else {
            const replacerLoc = await getLegalOfficerCase({ locId, api: api! })
            if (!replacerLoc) {
                setReplacerLocIdError("LOC not found on chain");
            } else if(replacerLoc.voidInfo !== undefined) {
                setReplacerLocIdError("Cannot be replaced by a VOID LOC");
            } else if(replacerLoc.locType !== loc?.locType) {
                setReplacerLocIdError(`Cannot be replaced by a LOC of type: ${replacerLoc.locType}`);
            } else {
                setReplacerLocIdError(undefined);
                const voidInfo: FullVoidInfo = {
                    reason,
                    replacer: locId
                }
                setVoidInfo(voidInfo);
                setSignAndSubmit(() => voidLocExtrinsic!(voidInfo));
            }
        }
        }
    }, [ replacerLocId, setReplacerLocIdError, setSignAndSubmit, voidLocExtrinsic, setVoidInfo, api, reason, locRequest, loc ]);

    const clearAndClose = useCallback(() => {
        setReason("");
        setReplacerLocId("");
        setReplacerLocIdError(undefined);
        setVisible(false);
    }, [ setReason, setReplacerLocId, setReplacerLocIdError, setVisible ]);

    if(locRequest === null) {
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
                        callback: checkAndVoid
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
                    signAndSubmit !== null && voidInfo !== null &&
                    <ExtrinsicSubmitter
                        id="voidLocSubmitter"
                        signAndSubmit={ signAndSubmit }
                        successMessage="LOC successfully voided"
                        onSuccess={ () => {
                            setVisible(false);
                            voidLoc!(voidInfo)
                            refresh!(false);
                        } }
                        onError={ () => {} }
                    />
                }
            </DangerDialog>
        </>
    );
}
