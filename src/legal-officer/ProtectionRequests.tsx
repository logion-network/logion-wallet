import React from 'react';

import PendingProtectionRequests from './PendingProtectionRequests';
import ProtectionRequestsHistory from './ProtectionRequestsHistory';
import RefreshTokenizationRequestsButton from './RefreshTokenizationRequestsButton';

export default function ProtectionRequests() {
    return (
        <>
            <h1>Protection Requests</h1>
            <RefreshTokenizationRequestsButton/>
            <PendingProtectionRequests />
            <ProtectionRequestsHistory />
        </>
    );
}
