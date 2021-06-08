import React from 'react';

import PendingProtectionRequests from './PendingProtectionRequests';
import ProtectionRequestsHistory from './ProtectionRequestsHistory';

export default function ProtectionRequests() {
    return (
        <>
            <h1>Protection Requests</h1>
            <PendingProtectionRequests />
            <ProtectionRequestsHistory />
        </>
    );
}
