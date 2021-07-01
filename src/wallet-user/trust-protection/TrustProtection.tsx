import React from 'react';

import {useRootContext} from "../../RootContext";
import {useUserContext} from "../UserContext";
import { findRequest } from "./Model";

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

    if(pendingProtectionRequest !== null) {
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
