import { useUserContext } from "../UserContext";

import GoToTrustProtection from './GoToTrustProtection';
import CreateProtectionRequestForm from "./CreateProtectionRequestForm";
import ProtectionRecoveryRequest from './ProtectionRecoveryRequest';
import RecoveryProcess from './RecoveryProcess';
import {
    AcceptedProtection,
    NoProtection,
    PendingProtection,
    UnavailableProtection,
    RejectedRecovery
} from "@logion/client";

export default function Recovery() {
    const { protectionState } = useUserContext();

    if (!protectionState) {
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
        } else if(protectionState instanceof AcceptedProtection) {
            return <ProtectionRecoveryRequest type='accepted' />;
        } else if(protectionState instanceof PendingProtection) {
            return <ProtectionRecoveryRequest type='pending' />;
        } else if (protectionState instanceof RejectedRecovery) {
            return <ProtectionRecoveryRequest type='rejected' />;
        } else {
            return null;
        }
    }
}
