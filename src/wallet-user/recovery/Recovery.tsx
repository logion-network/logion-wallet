import { useUserContext } from "../UserContext";

import GoToTrustProtection from './GoToTrustProtection';
import CreateProtectionRequestForm from "../protection/CreateProtectionRequestForm";
import ProtectionRecoveryRequest from '../protection/ProtectionRecoveryRequest';
import RecoveryProcess from './RecoveryProcess';
import {
    AcceptedRecovery,
    NoProtection,
    PendingRecovery,
    UnavailableProtection,
    RejectedRecovery
} from "@logion/client";

export default function Recovery() {
    const { protectionState } = useUserContext();

    if (!protectionState || protectionState.discarded) {
        return null;
    }

    if(protectionState instanceof UnavailableProtection) {
        return <ProtectionRecoveryRequest type='unavailable' />;
    } else if(protectionState instanceof NoProtection) {
        return <CreateProtectionRequestForm isRecovery={ true } />;
    } else {
        const goToTrustProtection = !protectionState.protectionParameters.isRecovery && !protectionState.protectionParameters.isActive;
        if(goToTrustProtection) {
            return <GoToTrustProtection />;
        } else if(protectionState.protectionParameters.isActive) {
            if(protectionState.protectionParameters.isClaimed) {
                return <RecoveryProcess />;
            } else {
                return <ProtectionRecoveryRequest type='activated' />;
            }
        } else if(protectionState instanceof AcceptedRecovery) {
            return <ProtectionRecoveryRequest type='accepted' />;
        } else if(protectionState instanceof PendingRecovery) {
            return <ProtectionRecoveryRequest type='pending' />;
        } else if (protectionState instanceof RejectedRecovery) {
            return <ProtectionRecoveryRequest type='rejected' />;
        } else {
            return null;
        }
    }
}
