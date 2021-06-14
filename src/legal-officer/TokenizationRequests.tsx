import React from 'react';

import PendingTokenizationRequests from './PendingTokenizationRequests';
import AcceptedTokenizationRequests from './AcceptedTokenizationRequests';
import RejectedTokenizationRequests from './RejectedTokenizationRequests';
import RefreshTokenizationRequestsButton from './RefreshTokenizationRequestsButton';

export default function TokenizationRequests() {
    return (
        <>
            <h1>Tokenization Requests</h1>
            <RefreshTokenizationRequestsButton/>
            <PendingTokenizationRequests />
            <AcceptedTokenizationRequests />
            <RejectedTokenizationRequests />
        </>
    );
}
