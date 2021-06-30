import React from 'react';

import { useRootContext } from "../../RootContext";
import { useUserContext } from "../UserContext";
import { findRequest, isRecovery } from "./Model";

import CreateProtectionRequestForm from "./CreateProtectionRequestForm";
import RequestActivating from './RequestActivating';
import RequestPending from './RequestPending';
import RequestActivated from './RequestActivated';

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
        return <RequestPending request={ pendingProtectionRequest } />;
    } else if(acceptedProtectionRequest !== null) {
        if(recoveryConfig.isEmpty) {
            return <RequestActivating />;
        } else {
            return <RequestActivated request={ acceptedProtectionRequest } />;
        }
    } else {
        return <CreateProtectionRequestForm isRecovery={ true } />;
    }
}
