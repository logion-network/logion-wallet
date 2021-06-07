import React from 'react';

import PendingTokenizationRequests from './PendingTokenizationRequests';
import AcceptedTokenizationRequests from './AcceptedTokenizationRequests';
import RejectedTokenizationRequests from './RejectedTokenizationRequests';
import RefreshRequestsButton from './RefreshRequestsButton';

export default function TokenizationRequests() {
    return (
        <>
            <h1>Tokenization Requests</h1>
            <RefreshRequestsButton/>
            <PendingTokenizationRequests />
            <AcceptedTokenizationRequests />
            <RejectedTokenizationRequests />
        </>
    );
}
