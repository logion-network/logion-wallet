import React from 'react';

import Tokenization from "./Tokenization";
import RefreshRequestsButton from './RefreshRequestsButton';
import PendingTokenizationRequests from './PendingTokenizationRequests';
import AcceptedTokenizationRequests from './AcceptedTokenizationRequests';
import RejectedTokenizationRequests from './RejectedTokenizationRequests';

export default function TokenizationRequests() {
    return (
        <>
            <h1>My Tokenization Requests</h1>
            <Tokenization/>
            <RefreshRequestsButton/>
            <PendingTokenizationRequests />
            <AcceptedTokenizationRequests />
            <RejectedTokenizationRequests />
        </>
    );
}
