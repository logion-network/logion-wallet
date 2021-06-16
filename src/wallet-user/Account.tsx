import React from 'react';

import { useLogionChain } from '../logion-chain';
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
    const { injectedAccounts } = useLogionChain();
    const { setUserAddress, colorTheme, addresses } = useUserContext();

    if(injectedAccounts === null || setUserAddress === null || addresses === null) {
        return null;
    }

    return (
        <ContentPane
            addresses={ addresses }
            selectAddress={ setUserAddress }
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
