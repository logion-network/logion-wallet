import React from 'react';

import { ContentPane } from '../common/Dashboard';
import Frame from '../common/Frame';

import { useCommonContext } from "../common/CommonContext";
import MyTokens from './MyTokens';
import Tokenization from "./Tokenization";
import RefreshRequestsButton from './RefreshRequestsButton';
import PendingTokenizationRequests from './PendingTokenizationRequests';
import AcceptedTokenizationRequests from './AcceptedTokenizationRequests';
import RejectedTokenizationRequests from './RejectedTokenizationRequests';

export default function Account() {
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
                <>
                    <Frame>
                        <MyTokens />
                        <Tokenization/>
                        <RefreshRequestsButton/>
                        <PendingTokenizationRequests />
                    </Frame>
                </>
            }
            secondaryAreaChildren={
                <>
                    <Frame>
                        <h2>History</h2>
                        <AcceptedTokenizationRequests />
                        <RejectedTokenizationRequests />
                    </Frame>
                </>
            }
        />
    );
}
