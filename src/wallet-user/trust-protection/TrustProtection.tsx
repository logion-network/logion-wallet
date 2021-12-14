import { useUserContext } from "../UserContext";
import { isRecovery } from "./Model";

import GoToRecovery from './GoToRecovery';
import CreateProtectionRequestForm from "./CreateProtectionRequestForm";
import ProtectionRecoveryRequest from './ProtectionRecoveryRequest';
import Loader from '../../common/Loader';
import { FullWidthPane } from '../../common/Dashboard';

export default function TrustProtection() {
    const { pendingProtectionRequests, acceptedProtectionRequests, recoveryConfig } = useUserContext();

    if (pendingProtectionRequests === null || acceptedProtectionRequests === null || recoveryConfig === null) {
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

    const requests = pendingProtectionRequests.concat(acceptedProtectionRequests);
    console.log(requests);

    if(recoveryConfig.isEmpty) {
        const goToRecovery = (pendingProtectionRequests.length > 0 && isRecovery(pendingProtectionRequests[0]))
            || (acceptedProtectionRequests.length > 0 && isRecovery(acceptedProtectionRequests[0]) && acceptedProtectionRequests[0].status !== 'ACTIVATED');

        if(goToRecovery) {
            return <GoToRecovery />;
        } else if(pendingProtectionRequests.length > 0) {
            return <ProtectionRecoveryRequest requests={ requests } type='pending' />;
        } else if(acceptedProtectionRequests.length === 2) {
            return <ProtectionRecoveryRequest requests={ requests } type='accepted' />;
        } else {
            return <CreateProtectionRequestForm isRecovery={ false } />;
        }
    } else {
        return <ProtectionRecoveryRequest requests={ requests } type='activated' />;
    }
}
