import React from 'react';
import {useUserContext} from "../UserContext";
import {legalOfficerName} from "./Model";
import {Link} from "react-router-dom";
import {USER_PATH} from "../../RootPaths";

export default function ConfirmProtectionRequest() {
    const {createdProtectionRequest} = useUserContext();

    if (createdProtectionRequest === null) {
        return null;
    }

    return (
        <>
            <p>
                Your Logion Trust Protection request ({createdProtectionRequest.id}) has been submitted. A Legal Officer
                will contact you as soon as possible to finalize the KYC process. Please note that, after your Legal
                Officer approvals, you will be able to access your account dashboard
            </p>
            <h2>Protection request status</h2>
            {createdProtectionRequest.decisions.map(decision => (
                <p>{legalOfficerName(decision.legalOfficerAddress)} ({decision.legalOfficerAddress}) : {decision.status}</p>
            ))}
            <Link to={ USER_PATH }>Back to dashboard</Link>
        </>
    )
}
