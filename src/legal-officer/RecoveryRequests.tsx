import React, { useState } from 'react';

import Tabs from '../component/Tabs';
import { FullWidthPane } from '../component/Dashboard';
import { useRootContext } from '../RootContext';

import { useLegalOfficerContext } from './LegalOfficerContext';
import PendingProtectionRequests from './PendingProtectionRequests';
import ProtectionRequestsHistory from './ProtectionRequestsHistory';
import './RecoveryRequests.css';

export default function RecoveryRequests() {
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme } = useLegalOfficerContext();
    const [ tabKey, setTabKey ] = useState<string>('pending');

    if(addresses === null || selectAddress === null) {
        return null;
    }

    return (
        <FullWidthPane
            className="RecoveryRequests"
            mainTitle="Recovery requests"
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
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
                        key: "history",
                        title: "History",
                        render: () => <ProtectionRequestsHistory recovery={ true } />
                    }
                ]}
                colors={ colorTheme.tabs }
            />
        </FullWidthPane>
    );
}
