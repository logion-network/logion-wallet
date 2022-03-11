import React from 'react';

import { useUserContext } from "../UserContext";
import { isRecovery } from "./Model";

import GoToTrustProtection from './GoToTrustProtection';
import CreateProtectionRequestForm from "./CreateProtectionRequestForm";
import ProtectionRecoveryRequest from './ProtectionRecoveryRequest';
import RecoveryProcess from './RecoveryProcess';

export default function Recovery() {
    const { pendingProtectionRequests, acceptedProtectionRequests, recoveryConfig, recoveredAddress } = useUserContext();

    if (pendingProtectionRequests === null || acceptedProtectionRequests === null || recoveryConfig === null
            || recoveredAddress === undefined) {
        return null;
    }

    const requests = pendingProtectionRequests.concat(acceptedProtectionRequests);
    const goToTrustProtection = (recoveredAddress === null)
        && (((pendingProtectionRequests.length > 0) && !isRecovery(pendingProtectionRequests[0]))
        || ((acceptedProtectionRequests.length > 0) && !isRecovery(acceptedProtectionRequests[0])));

    if(goToTrustProtection) {
        return <GoToTrustProtection />;
    } else if(recoveryConfig) {
        if(recoveredAddress !== null) {
            return <RecoveryProcess />;
        } else {
            return <ProtectionRecoveryRequest requests={ requests } type='activated' />;
        }
    } else if(acceptedProtectionRequests.length === 2) {
        return <ProtectionRecoveryRequest requests={ requests } type='accepted' />;
    } else if(requests.length > 0 && pendingProtectionRequests.length > 0) {
        return <ProtectionRecoveryRequest requests={ requests } type='pending' />;
    } else {
        return <CreateProtectionRequestForm isRecovery={ true } />;
    }
}
