import React from 'react';

import { ContentPane } from '../common/Dashboard';
import Frame from '../common/Frame';

import { useLegalOfficerContext } from './LegalOfficerContext';
import PendingTokenizationRequests from './PendingTokenizationRequests';
import AcceptedTokenizationRequests from './AcceptedTokenizationRequests';
import RejectedTokenizationRequests from './RejectedTokenizationRequests';
import RefreshTokenizationRequestsButton from './RefreshTokenizationRequestsButton';

export default function TokenizationRequests() {
    const { colorTheme } = useLegalOfficerContext();

    return (
        <ContentPane
            mainTitle="Tokens"
            titleIcon={{
                icon: {
                    id: 'tokens'
                },
                background: colorTheme.topMenuItems.iconGradient,
            }}
            colors={ colorTheme }
            primaryAreaChildren={
                <Frame
                    colors={ colorTheme }
                >
                    <RefreshTokenizationRequestsButton/>
                    <PendingTokenizationRequests />
                </Frame>
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
