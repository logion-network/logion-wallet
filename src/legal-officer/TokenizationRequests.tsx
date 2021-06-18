import React from 'react';

import { ContentPane } from '../component/Dashboard';
import Frame from '../component/Frame';

import { useLegalOfficerContext } from './LegalOfficerContext';
import PendingTokenizationRequests from './PendingTokenizationRequests';
import AcceptedTokenizationRequests from './AcceptedTokenizationRequests';
import RejectedTokenizationRequests from './RejectedTokenizationRequests';
import RefreshTokenizationRequestsButton from './RefreshTokenizationRequestsButton';

export default function TokenizationRequests() {
    const { colorTheme } = useLegalOfficerContext();

    return (
        <ContentPane
            primaryAreaChildren={
                <>
                    <h1>Tokens</h1>
                    <Frame
                        colors={ colorTheme }
                    >
                        <RefreshTokenizationRequestsButton/>
                        <PendingTokenizationRequests />
                    </Frame>
                </>
            }
            secondaryAreaChildren={
                <Frame
                    colors={ colorTheme }
                >
                    <h2>History</h2>
                    <AcceptedTokenizationRequests />
                    <RejectedTokenizationRequests />
                </Frame>
            }
        />
    );
}
