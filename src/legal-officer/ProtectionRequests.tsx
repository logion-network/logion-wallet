import React from 'react';

import { ContentPane } from '../component/Dashboard';
import Frame from '../component/Frame';
import { useRootContext } from '../RootContext';

import { useLegalOfficerContext } from './LegalOfficerContext';
import PendingProtectionRequests from './PendingProtectionRequests';
import ProtectionRequestsHistory from './ProtectionRequestsHistory';
import RefreshTokenizationRequestsButton from './RefreshTokenizationRequestsButton';

export default function ProtectionRequests() {
    const { addresses, selectAddress } = useRootContext();
    const { colorTheme } = useLegalOfficerContext();

    if(addresses === null || selectAddress === null) {
        return null;
    }

    return (
        <ContentPane
            addresses={ addresses }
            selectAddress={ selectAddress }
            colors={ colorTheme }
            primaryAreaChildren={
                <>
                    <h1>Protection Requests</h1>
                    <Frame
                        colors={ colorTheme }
                    >
                        <RefreshTokenizationRequestsButton/>
                        <PendingProtectionRequests />
                    </Frame>
                </>
            }
            secondaryAreaChildren={
                <Frame
                    colors={ colorTheme }
                >
                    <ProtectionRequestsHistory />
                </Frame>
            }
        />
    );
}
