import React from 'react';

import { ContentPane } from '../common/Dashboard';
import Frame from '../common/Frame';

import { useCommonContext } from '../common/CommonContext';
import PendingTokenizationRequests from './PendingTokenizationRequests';
import AcceptedTokenizationRequests from './AcceptedTokenizationRequests';
import RejectedTokenizationRequests from './RejectedTokenizationRequests';
import RefreshTokenizationRequestsButton from './RefreshTokenizationRequestsButton';

export default function TokenizationRequests() {
    const { colorTheme } = useCommonContext();

    return (
        <ContentPane
            mainTitle="Tokens"
            titleIcon={{
                icon: {
                    id: 'tokens'
                },
                background: colorTheme.topMenuItems.iconGradient,
            }}
            primaryAreaChildren={
                <Frame>
                    <RefreshTokenizationRequestsButton/>
                    <PendingTokenizationRequests />
                </Frame>
            }
            secondaryAreaChildren={
                <Frame>
                    <h2>History</h2>
                    <AcceptedTokenizationRequests />
                    <RejectedTokenizationRequests />
                </Frame>
            }
        />
    );
}
