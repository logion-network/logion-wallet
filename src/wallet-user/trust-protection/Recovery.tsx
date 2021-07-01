import React from 'react';

import { useRootContext } from "../../RootContext";
import { useUserContext } from "../UserContext";
import { findRequest, isRecovery } from "./Model";

import CreateProtectionRequestForm from "./CreateProtectionRequestForm";
import ProtectionRecoveryRequest from './ProtectionRecoveryRequest';

export default function Recovery() {
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
    const noRecoveryAllowed = (pendingProtectionRequest !== null && !isRecovery(pendingProtectionRequest))
        || (acceptedProtectionRequest !== null && !isRecovery(acceptedProtectionRequest));

    if(noRecoveryAllowed) {
        return (
            <>
                <h2>No recovery process can be started with this address</h2>
                <p>
                    If you want to recover the access to a given address, you have to create a new address
                    and then start the recovery process from there.
                </p>
            </>
        );
    } else if(pendingProtectionRequest !== null) {
        return <ProtectionRecoveryRequest request={ pendingProtectionRequest } type='pending' />;
    } else if(acceptedProtectionRequest !== null) {
        if(recoveryConfig.isEmpty) {
            return <ProtectionRecoveryRequest request={ acceptedProtectionRequest } type='accepted' />;
        } else {
            return <ProtectionRecoveryRequest request={ acceptedProtectionRequest } type='activated' />;
        }
    } else {
        return <CreateProtectionRequestForm isRecovery={ true } />;
    }
}
