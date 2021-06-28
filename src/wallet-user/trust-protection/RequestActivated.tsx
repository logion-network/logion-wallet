import React from 'react';

import { ProtectionRequest } from "../../legal-officer/Types";
import LegalOfficerInfo from "../../component/LegalOfficerInfo";

import { legalOfficerByAddress, checkActivation } from "./Model";
import { Button } from "react-bootstrap";

export interface Props {
    request: ProtectionRequest,
}

export default function RequestActivated(props: Props) {

    const [confirmButtonEnabled, setConfirmButtonEnabled] = React.useState(props.request.status === "PENDING");

    return (
        <>
            <h2>My Legal Officers</h2>
            <p>
                Your Logion Trust Protection is active. You are now protected by
            </p>
            <ul>
                {
                    props.request.decisions
                        .map(decision => {
                            const legalOfficer = legalOfficerByAddress(decision.legalOfficerAddress);
                            return (
                                <li key={legalOfficer.address}>
                                    <LegalOfficerInfo legalOfficer={legalOfficer}/>
                                </li>
                            );
                        })
                }
            </ul>
            {
                props.request.isRecovery &&
                <p>
                    You may initiate the actual recovery of account {props.request.addressToRecover}.
                </p>
            }
            {
                // This button is a safety net in case the same call at the previous step failed.
                // In most cases, it will not show
                confirmButtonEnabled &&
                <>
                    <p>Your protection does not seem to be confirmed yet.</p>
                    <Button id="btnConfirmProtection" onClick={() => {
                        checkActivation(props.request)
                            .then(() => setConfirmButtonEnabled(false))
                    }}>
                        Confirm protection
                    </Button>
                </>
            }
        </>
    );
}
