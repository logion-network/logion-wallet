import React from 'react';

import { ContentPane } from '../component/Dashboard';
import Frame from '../component/Frame';

import { useUserContext } from "./UserContext";
import MyTokens from './MyTokens';
import Tokenization from "./Tokenization";
import RefreshRequestsButton from './RefreshRequestsButton';
import PendingTokenizationRequests from './PendingTokenizationRequests';
import AcceptedTokenizationRequests from './AcceptedTokenizationRequests';
import RejectedTokenizationRequests from './RejectedTokenizationRequests';

export default function Account() {
    const { colorTheme } = useUserContext();

    return (
        <ContentPane
            primaryAreaChildren={
                <>
                    <h1>Tokens</h1>
                    <Frame
                        colors={ colorTheme }
                    >
                        <MyTokens />
                        <Tokenization/>
                        <RefreshRequestsButton/>
                        <PendingTokenizationRequests />
                    </Frame>
                </>
            }
            secondaryAreaChildren={
                <>
                    <Frame
                        colors={ colorTheme }
                    >
                        <h2>History</h2>
                        <AcceptedTokenizationRequests />
                        <RejectedTokenizationRequests />
                    </Frame>
                </>
            }
        />
    );
}
