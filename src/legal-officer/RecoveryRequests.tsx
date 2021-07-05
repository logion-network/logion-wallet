import React, { useState } from 'react';

import Tabs from '../component/Tabs';
import { FullWidthPane } from '../component/Dashboard';
import Frame from '../component/Frame';
import { useRootContext } from '../RootContext';

import { useLegalOfficerContext } from './LegalOfficerContext';
import PendingProtectionRequests from './PendingProtectionRequests';
import ProtectionRequestsHistory from './ProtectionRequestsHistory';

export default function RecoveryRequests() {
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme } = useLegalOfficerContext();
    const [ tabKey, setTabKey ] = useState<string>('pending');

    if(addresses === null || selectAddress === null) {
        return null;
    }

    return (
        <FullWidthPane
            mainTitle="Recovery requests"
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
        >
                <Frame
                        colors={colorTheme}
                >
                    <Tabs
                        activeKey={ tabKey }
                        onSelect={ key => setTabKey(key || 'pending') }
                        tabs={[
                            {
                                key: "pending",
                                title: "Pending",
                                render: () => <PendingProtectionRequests recovery={ true } />
                            },
                            {
                                key: "executed",
                                title: "Executed",
                                render: () => <ProtectionRequestsHistory recovery={ true } />
                            }
                        ]}
                    />
                </Frame>
        </FullWidthPane>
    );
}
