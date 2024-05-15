import Checkbox from "../../components/toggle/Checkbox";
import { useState, useCallback, useMemo } from "react";
import Button from "../../common/Button";
import Icon from "../../common/Icon";
import Dialog from "../../common/Dialog";
import { useLocContext } from "../LocContext";
import { CallCallback, useLogionChain } from "../../logion-chain";
import { ClosedIdentityLoc } from "@logion/client";
import './Nominate.css';
import ExtrinsicSubmissionStateView from "src/ExtrinsicSubmissionStateView";

type Status = 'Idle' | 'Selected' | 'Confirming' | 'Error';

export default function Nominate() {
    const { loc, mutateLocState } = useLocContext();
    const { signer, submitCall, clearSubmissionState } = useLogionChain();
    const [ status, setStatus ] = useState<Status>('Idle');

    const isIssuer = useMemo(() => loc?.verifiedIssuer || false, [ loc ]);

    const clearState = useCallback(async () => {
        setStatus('Idle');
        clearSubmissionState();
    }, [ clearSubmissionState ]);

    const changeIssuer = useCallback(async () => {
        setStatus('Confirming');
        const call = async (callback: CallCallback) => mutateLocState(async current => {
            if(signer && current instanceof ClosedIdentityLoc) {
                if(isIssuer) {
                    return current.legalOfficer.dismissIssuer({
                        signer,
                        callback,
                    });
                } else {
                    return current.legalOfficer.nominateIssuer({
                        signer,
                        callback,
                    });
                }
            } else {
                return current;
            }
        });
        try {
            await submitCall(call);
            clearState();
        } catch(e) {
            setStatus("Error");
        }
    }, [ mutateLocState, isIssuer, signer, clearState, submitCall ]);

    return (
        <>
            <Button id="NominateButton" onClick={ () => setStatus('Selected') }>
                <Icon icon={ { id: "issuer" } }/>
                Verified Issuer
                <Checkbox checked={ isIssuer } skin="Toggle white" />
            </Button>
            <Dialog
                show={ status !== 'Idle' }
                size="lg"
                actions={ [
                    {
                        id: "cancel",
                        callback: clearState,
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                        disabled: status === 'Confirming'
                    },
                    {
                        id: "submit",
                        callback: () => changeIssuer(),
                        buttonText: 'Confirm',
                        buttonVariant: 'polkadot',
                        disabled: status === 'Confirming' || status === 'Error'
                    }
                ] }
            >
                { !isIssuer && <>
                    <h3>Verified Issuer Nomination</h3>
                    <p>The person linked to this Identity LOC is about to have the status of Verified Issuer.</p>
                    <p>With that status, you (and only you) will be able to select that nominated Verified Issuer
                        in a LOC to contribute as a trustable source of public data and confidential documents. You will
                        still have to validate these contributions before blockchain publication.</p>
                    <p>Do you confirm you want to make this person a Verified Issuer?</p>
                </> }
                { isIssuer && <>
                    <h3>Verified Issuer Dismissal</h3>
                    <p>The person linked to this Identity LOC has the status of Verified Issuer.</p>
                    <p>
                        <Icon type="png" icon={ { id: "big-warning" } } width="105px"/>
                    </p>
                    <p>You are about to cancel this status:<br />
                        <strong>this person will not be able to contribute to all the LOC
                            (s)he is currently involved with.</strong></p>
                    <p>Do you confirm you want to cancel the Verified Issuer status for this person?</p>
                </> }
                <ExtrinsicSubmissionStateView />
            </Dialog>
        </>
    )
}
