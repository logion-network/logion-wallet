import {
    AcceptedRecovery,
    NoProtection,
    PendingRecovery,
    RejectedRecovery,
    UnavailableProtection,
} from "@logion/client";

import { useUserContext } from "../UserContext";

import CreateProtectionRequestForm from "./CreateProtectionRequestForm";
import ProtectionRecoveryRequest from './ProtectionRecoveryRequest';
import Loader from '../../common/Loader';
import { FullWidthPane } from '../../common/Dashboard';
import RecoveryProcess from "../recovery/RecoveryProcess";

export default function TrustProtection() {
    const { protectionState } = useUserContext();

    if (!protectionState || protectionState.discarded) {
        return (
            <FullWidthPane
                mainTitle="My Logion Protection"
                titleIcon={{
                    icon: {
                        id: 'shield',
                        hasVariants: true,
                    },
                }}
            >
                <Loader />
            </FullWidthPane>
        );
    }

    if(protectionState instanceof UnavailableProtection) {
        return <ProtectionRecoveryRequest type='unavailable' />;
    } else if(protectionState instanceof NoProtection) {
        return <CreateProtectionRequestForm />;
    } else {
        if(protectionState.protectionParameters.isRecovery) {
            if(protectionState.protectionParameters.isActive) {
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
        } else {
            if(protectionState.protectionParameters.isActive) {
                return <ProtectionRecoveryRequest type='activated' />;
            } else {
                return null;
            }
        }
    }
}
