import React from 'react';

import { ContentPane } from '../component/Dashboard';
import Frame from '../component/Frame';
import { useRootContext } from '../RootContext';

import { useUserContext } from "./UserContext";
import MyTokens from './MyTokens';
import Tokenization from "./Tokenization";
import RefreshRequestsButton from './RefreshRequestsButton';
import PendingTokenizationRequests from './PendingTokenizationRequests';
import AcceptedTokenizationRequests from './AcceptedTokenizationRequests';
import RejectedTokenizationRequests from './RejectedTokenizationRequests';

export default function Account() {
    const { addresses, selectAddress } = useRootContext();
    const { colorTheme } = useUserContext();

    if(selectAddress === null || addresses === null) {
        return null;
    }

    return (
        <ContentPane
            addresses={ addresses }
            selectAddress={ selectAddress }
            colors={ colorTheme }
            primaryAreaChildren={
                <>
                    <h1>Tokens</h1>
                    <Frame
                        colors={ colorTheme.frame }
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
                        colors={ colorTheme.frame }
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
