import React from 'react';

import { ProtectionRequest } from "../../legal-officer/Types";
import LegalOfficerInfo from "../../component/LegalOfficerInfo";

import { legalOfficerByAddress } from "./Model";

export interface Props {
    request: ProtectionRequest,
}

export default function RequestActivated(props: Props) {

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
        </>
    );
}
