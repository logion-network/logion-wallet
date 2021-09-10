import React from 'react';

import { useCommonContext } from "../../common/CommonContext";
import { useUserContext } from "../UserContext";
import { findRequest, isRecovery } from "./Model";

import GoToTrustProtection from './GoToTrustProtection';
import CreateProtectionRequestForm from "./CreateProtectionRequestForm";
import ProtectionRecoveryRequest from './ProtectionRecoveryRequest';
import RecoveryProcess from './RecoveryProcess';

export default function Recovery() {
    const { accounts } = useCommonContext();
    const { pendingProtectionRequests, acceptedProtectionRequests, recoveryConfig, recoveredAddress } = useUserContext();

    if (pendingProtectionRequests === null || acceptedProtectionRequests === null || recoveryConfig === null
            || recoveredAddress === undefined) {
        return null;
    }

    const pendingProtectionRequest = findRequest({
        address: accounts!.current!.address,
        requests: pendingProtectionRequests
    });
    const acceptedProtectionRequest = findRequest({
        address: accounts!.current!.address,
        requests: acceptedProtectionRequests
    });
    const goToTrustProtection = (pendingProtectionRequest !== null && !isRecovery(pendingProtectionRequest))
        || (acceptedProtectionRequest !== null && !isRecovery(acceptedProtectionRequest));

    if(goToTrustProtection) {
        return <GoToTrustProtection />;
    } else if(pendingProtectionRequest !== null) {
        return <ProtectionRecoveryRequest request={ pendingProtectionRequest } type='pending' />;
    } else if(acceptedProtectionRequest !== null) {
        if(recoveryConfig.isEmpty) {
            return <ProtectionRecoveryRequest request={ acceptedProtectionRequest } type='accepted' />;
        } else if(recoveryConfig.isSome && recoveredAddress === null) {
            return <ProtectionRecoveryRequest request={ acceptedProtectionRequest } type='activated' />;
        } else {
            return <RecoveryProcess />;
        }
    } else {
        return <CreateProtectionRequestForm isRecovery={ true } />;
    }
}
