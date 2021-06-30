import React from 'react';

import {useRootContext} from "../../RootContext";
import {useUserContext} from "../UserContext";
import { findRequest } from "./Model";

import CreateProtectionRequestForm from "./CreateProtectionRequestForm";
import RequestActivating from './RequestActivating';
import RequestPending from './RequestPending';
import RequestActivated from './RequestActivated';

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
        return <RequestPending request={ pendingProtectionRequest } />;
    } else if(acceptedProtectionRequest !== null) {
        if(recoveryConfig.isEmpty) {
            return <RequestActivating />;
        } else {
            return <RequestActivated request={ acceptedProtectionRequest } />;
        }
    } else {
        return <CreateProtectionRequestForm isRecovery={ false } />;
    }
}
