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
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme } = useUserContext();

    if(addresses === null || selectAddress === null) {
        return null;
    }

    return (
        <ContentPane
            mainTitle="Tokens"
            titleIcon={{
                id: 'tokens',
            }}
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
            primaryAreaChildren={
                <>
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
