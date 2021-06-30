import React from 'react';

import { ContentPane } from '../component/Dashboard';
import Frame from '../component/Frame';
import { useRootContext } from '../RootContext';

import { useLegalOfficerContext } from './LegalOfficerContext';
import PendingProtectionRequests from './PendingProtectionRequests';
import ProtectionRequestsHistory from './ProtectionRequestsHistory';
import RefreshTokenizationRequestsButton from './RefreshTokenizationRequestsButton';

export default function RecoveryRequests() {
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme } = useLegalOfficerContext();

    if(addresses === null || selectAddress === null) {
        return null;
    }

    return (
        <ContentPane
            mainTitle="Recovery requests"
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
            primaryAreaChildren={
                <Frame
                        colors={colorTheme}
                >
                    <RefreshTokenizationRequestsButton/>
                    <PendingProtectionRequests recovery={ true } />
                </Frame>
            }
            secondaryAreaChildren={
                <Frame
                    colors={ colorTheme }
                >
                    <ProtectionRequestsHistory recovery={ true } />
                </Frame>
            }
        />
    );
}
