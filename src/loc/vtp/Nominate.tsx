import Checkbox from "../../components/toggle/Checkbox";
import { useState, useCallback } from "react";
import Button from "../../common/Button";
import Icon from "../../common/Icon";
import Dialog from "../../common/Dialog";
import { useLocContext } from "../LocContext";
import { useLogionChain } from "../../logion-chain";
import { ClosedLoc } from "@logion/client";
import { setVerifiedThirdParty } from "../../legal-officer/client";
import './Nominate.css';

export default function Nominate() {

    type Status = 'Idle' | 'Selected' | 'Confirming';
    const { loc, mutateLocState } = useLocContext();
    const { client } = useLogionChain();
    const [ vtp, setVtp ] = useState<boolean>(loc?.verifiedThirdParty || false);
    const [ status, setStatus ] = useState<Status>('Idle');
    const changeVtp = useCallback(async (newValue: boolean) => {
        setStatus('Confirming');
        await mutateLocState(async current => {
            if (client && current instanceof ClosedLoc) {
                return setVerifiedThirdParty({ locState: current, isVerifiedThirdParty: newValue })
            } else {
                return current
            }
        })
        setStatus('Idle');
        setVtp(newValue);
    }, [ client, mutateLocState ]);

    return (
        <>
            <Button id="NominateButton" onClick={ () => setStatus('Selected') }>
                <Icon icon={ { id: "vtp" } } />
                Verified Third Party
                <Checkbox checked={ vtp } skin="Toggle" />
            </Button>
            <Dialog
                show={ status !== 'Idle' }
                size="lg"
                actions={ [
                    {
                        id: "cancel",
                        callback: () => setStatus('Idle'),
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                    },
                    {
                        id: "submit",
                        callback: () => changeVtp(!vtp),
                        buttonText: 'Confirm',
                        buttonVariant: 'primary',
                        disabled: status === 'Confirming'
                    }
                ] }
            >
                { !vtp && <>
                    <h3>Verified Third Party Nomination</h3>
                    <p>The person linked to this Identity LOC is about to have the status of Verified Third Party.</p>
                    <p>With that status, you (and only you) will be able to select that nominated Verified Third Party
                        in a LOC to contribute as a trustable source of public data and confidential documents. You will
                        still have to validate these contributions before blockchain publication.</p>
                    <p>Do you confirm you want to make this person a Verified Third Party?</p>
                </> }
                { vtp && <>
                    <h3>Verified Third Party Dismissal</h3>
                    <p>The person linked to this Identity LOC has the status of Verified Third Party.</p>
                    <p>You are about to cancel this status: this person will not be able to contribute to all the LOC
                        (s)he is currently involved with.</p>
                    <p>Do you confirm you want to cancel the Verified Third Party status for this person?</p>
                </> }
            </Dialog>
        </>
    )
}
