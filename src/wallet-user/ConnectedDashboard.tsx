import React from 'react';

import Tokenization from "./Tokenization";
import RefreshRequestsButton from './RefreshRequestsButton';
import PendingTokenizationRequests from './PendingTokenizationRequests';
import AcceptedTokenizationRequests from './AcceptedTokenizationRequests';
import RejectedTokenizationRequests from './RejectedTokenizationRequests';

export default function ConnectedDashboard() {
    return (
        <>
            <Tokenization/>
            <RefreshRequestsButton/>
            <PendingTokenizationRequests />
            <AcceptedTokenizationRequests />
            <RejectedTokenizationRequests />
        </>
    );
}
