import React from 'react';

import {useUserContext} from "../UserContext";
import {legalOfficerByAddress} from "./Model";
import {ProtectionRequest} from "../../legal-officer/Types";

import CreateProtectionRequestForm from "./CreateProtectionRequestForm";
import LegalOfficerInfo from "../../component/LegalOfficerInfo";
import ProtectionRequestActivating from './ProtectionRequestActivating';

export default function ProtectionRequestStatus() {
    const { pendingProtectionRequests, acceptedProtectionRequests, recoveryConfig } = useUserContext();

    if (pendingProtectionRequests === null || acceptedProtectionRequests === null) {
        return null;
    }

    if(pendingProtectionRequests.length > 0) {
        const createdProtectionRequest: ProtectionRequest = pendingProtectionRequests[0];

        return (
            <>
                <h2>Protection request status</h2>
                <p>
                    Your Logion Trust Protection request ({createdProtectionRequest.id}) has been submitted. A Legal Officer
                    will contact you as soon as possible to finalize the KYC process. Please note that, after the successful
                    completion of one of your Legal Officer approval processes, you will be able to use all features
                    provided by your logion account dashboard.
                </p>
                <ul>
                {
                    createdProtectionRequest.decisions.map(decision => (
                        <li key={decision.legalOfficerAddress}>
                            {legalOfficerByAddress(decision.legalOfficerAddress).name} ({decision.legalOfficerAddress}): {decision.status}
                        </li>
                    ))
                }
                </ul>
            </>
        );
    } else if(acceptedProtectionRequests.length > 0) {
        const createdProtectionRequest: ProtectionRequest = acceptedProtectionRequests[0];

        if(recoveryConfig!.isEmpty) {
            return <ProtectionRequestActivating />;
        } else {
            return (
                <>
                    <h2>My Legal Officers</h2>
                    <p>
                        Your Logion Trust Protection is active. You are now protected by
                    </p>
                    <ul>
                        {
                            createdProtectionRequest.decisions
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
                </>
            );
        }
    } else {
        return <CreateProtectionRequestForm />;
    }
}
