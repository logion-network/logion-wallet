import React from 'react';
import {useUserContext} from "../UserContext";
import {legalOfficerName} from "./Model";

export default function ConfirmProtectionRequest() {
    const {createdProtectionRequest} = useUserContext();

    if (createdProtectionRequest === null) {
        return null;
    }

    return (
        <>
            <h1>Protection request status</h1>
            <p>
                Your Logion Trust Protection request ({createdProtectionRequest.id}) has been submitted. A Legal Officer
                will contact you as soon as possible to finalize the KYC process. Please note that, after the successful
                completion of one of your Legal Officer approval processes, you will be able to use all features
                provided by your logion account dashboard.
            </p>
            {createdProtectionRequest.decisions.map(decision => (
                <p key={decision.legalOfficerAddress}>{legalOfficerName(decision.legalOfficerAddress)} ({decision.legalOfficerAddress})
                    : {decision.status}</p>
            ))}
        </>
    )
}
