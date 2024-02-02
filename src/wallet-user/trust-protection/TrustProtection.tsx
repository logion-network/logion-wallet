import {
    NoProtection,
    UnavailableProtection,
} from "@logion/client";

import { useUserContext } from "../UserContext";

import GoToRecovery from './GoToRecovery';
import CreateProtectionRequestForm from "./CreateProtectionRequestForm";
import ProtectionRecoveryRequest from './ProtectionRecoveryRequest';
import Loader from '../../common/Loader';
import { FullWidthPane } from '../../common/Dashboard';

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
        return <CreateProtectionRequestForm isRecovery={ false } />;
    } else {
        const goToRecovery = protectionState.protectionParameters.isRecovery && !protectionState.protectionParameters.isClaimed;
        if(goToRecovery) {
            return <GoToRecovery />;
        } else if(protectionState.protectionParameters.isActive) {
            return <ProtectionRecoveryRequest type='activated' />;
        } else {
            return null;
        }
    }
}
