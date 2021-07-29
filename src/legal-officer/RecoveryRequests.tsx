import React, { useState } from 'react';

import Tabs from '../common/Tabs';
import { FullWidthPane } from '../common/Dashboard';

import { useLegalOfficerContext } from './LegalOfficerContext';
import PendingProtectionRequests from './PendingProtectionRequests';
import ProtectionRequestsHistory from './ProtectionRequestsHistory';
import './RecoveryRequests.css';

export default function RecoveryRequests() {
    const { colorTheme } = useLegalOfficerContext();
    const [ tabKey, setTabKey ] = useState<string>('pending');

    return (
        <FullWidthPane
            className="RecoveryRequests"
            mainTitle="Recovery requests"
            titleIcon={{
                icon: {
                    id: 'recovery_request',
                    hasVariants: true,
                },
            }}
            colors={ colorTheme }
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
