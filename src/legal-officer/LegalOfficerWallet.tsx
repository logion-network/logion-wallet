import React from 'react';

import { LegalOfficerContextProvider } from './LegalOfficerContext';
import PendingTokenizationRequests from './PendingTokenizationRequests';

export default function LegalOfficerWallet() {
    return (
        <LegalOfficerContextProvider legalOfficerAddress="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY">
            <PendingTokenizationRequests />
        </LegalOfficerContextProvider>
    );
}
