import React from 'react';

import {useUserContext} from "../UserContext";
import { isRecovery } from "./Model";

import GoToRecovery from './GoToRecovery';
import CreateProtectionRequestForm from "./CreateProtectionRequestForm";
import ProtectionRecoveryRequest from './ProtectionRecoveryRequest';

export default function TrustProtection() {
    const { pendingProtectionRequests, acceptedProtectionRequests, recoveryConfig } = useUserContext();

    if (pendingProtectionRequests === null || acceptedProtectionRequests === null || recoveryConfig === null) {
        return null;
    }

    const requests = pendingProtectionRequests.concat(acceptedProtectionRequests);
    const goToRecovery = (pendingProtectionRequests.length > 0 && isRecovery(pendingProtectionRequests[0]))
        || (acceptedProtectionRequests.length > 0 && isRecovery(acceptedProtectionRequests[0]) && acceptedProtectionRequests[0].status !== 'ACTIVATED');

    if(goToRecovery) {
        return <GoToRecovery />;
    } else if(pendingProtectionRequests.length > 0) {
        return <ProtectionRecoveryRequest requests={ requests } type='pending' />;
    } else if(acceptedProtectionRequests.length === 2) {
        if(recoveryConfig.isEmpty) {
            return <ProtectionRecoveryRequest requests={ requests } type='accepted' />;
        } else {
            return <ProtectionRecoveryRequest requests={ requests } type='activated' />;
        }
    } else {
        return <CreateProtectionRequestForm isRecovery={ false } />;
    }
}
