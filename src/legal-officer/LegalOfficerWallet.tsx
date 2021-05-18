import React from 'react';

import Shell from '../Shell';

import { LegalOfficerContextProvider } from './LegalOfficerContext';
import { DEFAULT_LEGAL_OFFICER } from './Model';
import PendingTokenizationRequests from './PendingTokenizationRequests';
import RejectedTokenizationRequests from './RejectedTokenizationRequests';

export default function LegalOfficerWallet() {
    return (
        <LegalOfficerContextProvider legalOfficerAddress={DEFAULT_LEGAL_OFFICER}>
            <Shell>
                <PendingTokenizationRequests />
                <RejectedTokenizationRequests />
            </Shell>
        </LegalOfficerContextProvider>
    );
}
