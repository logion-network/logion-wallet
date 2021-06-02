import React from 'react';

import Shell from '../Shell';

import { LegalOfficerContextProvider } from './LegalOfficerContext';
import { DEFAULT_LEGAL_OFFICER } from './Model';
import PendingTokenizationRequests from './PendingTokenizationRequests';
import AcceptedTokenizationRequests from './AcceptedTokenizationRequests';
import RejectedTokenizationRequests from './RejectedTokenizationRequests';
import RefreshRequestsButton from './RefreshRequestsButton';

export default function LegalOfficerWallet() {
    return (
        <LegalOfficerContextProvider legalOfficerAddress={DEFAULT_LEGAL_OFFICER}>
            <Shell backgroundCss="linear-gradient(to right, #a158ff, 90%, #203acf)">
                <RefreshRequestsButton/>
                <PendingTokenizationRequests />
                <AcceptedTokenizationRequests />
                <RejectedTokenizationRequests />
            </Shell>
        </LegalOfficerContextProvider>
    );
}
