import React from 'react';

import {useRootContext} from "../../RootContext";
import {useUserContext} from "../UserContext";
import { findRequest, isRecovery } from "./Model";

import GoToRecovery from './GoToRecovery';
import CreateProtectionRequestForm from "./CreateProtectionRequestForm";
import ProtectionRecoveryRequest from './ProtectionRecoveryRequest';

export default function TrustProtection() {
    const { currentAddress } = useRootContext();
    const { pendingProtectionRequests, acceptedProtectionRequests, recoveryConfig } = useUserContext();

    if (pendingProtectionRequests === null || acceptedProtectionRequests === null || recoveryConfig === null) {
        return null;
    }

    const pendingProtectionRequest = findRequest({
        address: currentAddress,
        requests: pendingProtectionRequests
    });
    const acceptedProtectionRequest = findRequest({
        address: currentAddress,
        requests: acceptedProtectionRequests
    });
    const goToRecovery = (pendingProtectionRequest !== null && isRecovery(pendingProtectionRequest))
        || (acceptedProtectionRequest !== null && isRecovery(acceptedProtectionRequest));

    if(goToRecovery) {
        return <GoToRecovery />;
    } else if(pendingProtectionRequest !== null) {
        return <ProtectionRecoveryRequest request={ pendingProtectionRequest } type='pending' />;
    } else if(acceptedProtectionRequest !== null) {
        if(recoveryConfig.isEmpty) {
            return <ProtectionRecoveryRequest request={ acceptedProtectionRequest } type='accepted' />;
        } else {
            return <ProtectionRecoveryRequest request={ acceptedProtectionRequest } type='activated' />;
        }
    } else {
        return <CreateProtectionRequestForm isRecovery={ false } />;
    }
}
