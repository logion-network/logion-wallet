import React from 'react';

import Shell from '../Shell';

import { LegalOfficerContextProvider } from './LegalOfficerContext';
import { DEFAULT_LEGAL_OFFICER } from './Model';
import Menu from './Menu';
import LegalOfficerRouter from './LegalOfficerRouter';

export default function LegalOfficerWallet() {
    return (
        <LegalOfficerContextProvider legalOfficerAddress={DEFAULT_LEGAL_OFFICER}>
            <Shell backgroundCss="linear-gradient(to right, #a158ff, 90%, #203acf)">
                <Menu />
                <LegalOfficerRouter />
            </Shell>
        </LegalOfficerContextProvider>
    );
}
