import React from 'react';

import { useLogionChain } from '../logion-chain';

import { LegalOfficerContextProvider } from './LegalOfficerContext';
import ContextualizedWallet from './ContextualizedWallet';

export default function LegalOfficerWallet() {
    const { injectedAccounts } = useLogionChain();

    if(injectedAccounts === null) {
        return null;
    }

    return (
        <LegalOfficerContextProvider>
            <ContextualizedWallet />
        </LegalOfficerContextProvider>
    );
}
