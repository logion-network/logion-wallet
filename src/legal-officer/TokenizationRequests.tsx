import React from 'react';

import { ContentPane } from '../component/Dashboard';
import Frame from '../component/Frame';
import { useRootContext } from '../RootContext';

import { useLegalOfficerContext } from './LegalOfficerContext';
import PendingTokenizationRequests from './PendingTokenizationRequests';
import AcceptedTokenizationRequests from './AcceptedTokenizationRequests';
import RejectedTokenizationRequests from './RejectedTokenizationRequests';
import RefreshTokenizationRequestsButton from './RefreshTokenizationRequestsButton';

export default function TokenizationRequests() {
    const { addresses, selectAddress } = useRootContext();
    const { colorTheme } = useLegalOfficerContext();

    if(addresses === null || selectAddress === null) {
        return null;
    }

    console.log(addresses.currentAddress);

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
                        <RefreshTokenizationRequestsButton/>
                        <PendingTokenizationRequests />
                    </Frame>
                </>
            }
            secondaryAreaChildren={
                <Frame
                    colors={ colorTheme.frame }
                >
                    <h2>History</h2>
                    <AcceptedTokenizationRequests />
                    <RejectedTokenizationRequests />
                </Frame>
            }
        />
    );
}
