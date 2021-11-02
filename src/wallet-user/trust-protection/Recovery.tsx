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
    const goToTrustProtection = ((pendingProtectionRequests.length > 0) && !isRecovery(pendingProtectionRequests[0]))
        || ((acceptedProtectionRequests.length > 0) && !isRecovery(acceptedProtectionRequests[0]));

    if(goToTrustProtection) {
        console.log(pendingProtectionRequests);
        console.log(acceptedProtectionRequests);
        return <GoToTrustProtection />;
    } else if(pendingProtectionRequests.length > 0) {
        return <ProtectionRecoveryRequest requests={ requests } type='pending' />;
    } else if(acceptedProtectionRequests.length === 2) {
        if(recoveryConfig.isEmpty) {
            return <ProtectionRecoveryRequest requests={ requests } type='accepted' />;
        } else if(recoveryConfig.isSome && recoveredAddress === null) {
            return <ProtectionRecoveryRequest requests={ requests } type='activated' />;
        } else {
            return <RecoveryProcess />;
        }
    } else {
        return <CreateProtectionRequestForm isRecovery={ true } />;
    }
}
