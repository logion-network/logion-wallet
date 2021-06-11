import React from 'react';

import Shell from '../Shell';
import { useLogionChain } from '../logion-chain';

import { LegalOfficerContextProvider } from './LegalOfficerContext';
import { DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER } from './Types';
import Menu from './Menu';
import LegalOfficerRouter from './LegalOfficerRouter';

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
            <Shell backgroundCss="linear-gradient(to right, #a158ff, 90%, #203acf)">
                <Menu />
                <LegalOfficerRouter />
            </Shell>
        </LegalOfficerContextProvider>
    );
}
