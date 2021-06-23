import React from 'react';

import { ContentPane } from '../component/Dashboard';
import Frame from '../component/Frame';

import { useLegalOfficerContext } from './LegalOfficerContext';
import PendingProtectionRequests from './PendingProtectionRequests';
import ProtectionRequestsHistory from './ProtectionRequestsHistory';
import RefreshTokenizationRequestsButton from './RefreshTokenizationRequestsButton';

export default function RecoveryRequests() {
    const { colorTheme } = useLegalOfficerContext();

    return (
        <ContentPane
            primaryAreaChildren={
                <>
                    <h1>Recovery Requests</h1>
                    <Frame
                            colors={colorTheme}
                    >
                        <RefreshTokenizationRequestsButton/>
                        <PendingProtectionRequests recovery={ true } />
                    </Frame>
                </>
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
