import React from 'react';

import { LegalOfficerContextProvider } from './LegalOfficerContext';
import PendingTokenizationRequests from './PendingTokenizationRequests';
import { DEFAULT_LEGAL_OFFICER } from './Model';

export default function LegalOfficerWallet() {
    return (
        <LegalOfficerContextProvider legalOfficerAddress={DEFAULT_LEGAL_OFFICER}>
            <PendingTokenizationRequests />
        </LegalOfficerContextProvider>
    );
}
