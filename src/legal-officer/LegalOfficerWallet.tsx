import React from 'react';

import { useLogionChain } from '../logion-chain';

import { LegalOfficerContextProvider } from './LegalOfficerContext';
import { DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER } from './Types';
import ContextualizedWallet from './ContextualizedWallet';

export default function LegalOfficerWallet() {
    const { injectedAccounts } = useLogionChain();

    if(injectedAccounts === null) {
        return null;
    }

    let legalOfficer;
    if(injectedAccounts.map(injectedAccount => injectedAccount.address).includes(DEFAULT_LEGAL_OFFICER)) {
        legalOfficer = DEFAULT_LEGAL_OFFICER;
    } else {
        legalOfficer = ANOTHER_LEGAL_OFFICER;
    }

    return (
        <LegalOfficerContextProvider legalOfficerAddress={ legalOfficer }>
            <ContextualizedWallet />
        </LegalOfficerContextProvider>
    );
}
