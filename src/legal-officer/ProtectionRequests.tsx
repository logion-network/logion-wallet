import React from 'react';

import { ContentPane } from '../component/Dashboard';
import Frame from '../component/Frame';
import { useRootContext } from '../RootContext';

import { useLegalOfficerContext } from './LegalOfficerContext';
import PendingProtectionRequests from './PendingProtectionRequests';
import ProtectionRequestsHistory from './ProtectionRequestsHistory';
import RefreshTokenizationRequestsButton from './RefreshTokenizationRequestsButton';
import ProtectedUsers from "./ProtectedUsers";

export default function ProtectionRequests() {
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme } = useLegalOfficerContext();

    if(addresses === null || selectAddress === null) {
        return null;
    }

    return (
        <ContentPane
            mainTitle="Protection requests"
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
            primaryAreaChildren={
                <>
                    <Frame
                            colors={colorTheme}
                    >
                        <RefreshTokenizationRequestsButton/>
                        <PendingProtectionRequests recovery={ false } />
                    </Frame>
                    <h1>Activated User Account Protection under my watch</h1>
                    <Frame
                            colors={colorTheme}
                    >
                        <ProtectedUsers/>
                    </Frame>
                </>
            }
            secondaryAreaChildren={
                <Frame
                    colors={ colorTheme }
                >
                    <ProtectionRequestsHistory recovery={ false } />
                </Frame>
            }
        />
    );
}
