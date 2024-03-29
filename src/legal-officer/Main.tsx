import { useLogionChain } from '../logion-chain';

import { LegalOfficerContextProvider } from './LegalOfficerContext';
import LegalOfficerDashboard from './LegalOfficerDashboard';

export default function LegalOfficerWallet() {
    const { injectedAccounts } = useLogionChain();

    if(injectedAccounts === null) {
        return null;
    }

    return (
        <LegalOfficerContextProvider>
            <LegalOfficerDashboard />
        </LegalOfficerContextProvider>
    );
}
