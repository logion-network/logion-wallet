import React, { useState } from 'react';

import Tabs from '../common/Tabs';
import { FullWidthPane } from '../common/Dashboard';

import PendingProtectionRequests from './PendingProtectionRequests';
import RecoveryRequestsHistory from './RecoveryRequestsHistory';
import './RecoveryRequests.css';

export default function RecoveryRequests() {
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
                        render: () => <RecoveryRequestsHistory />
                    }
                ]}
            />
        </FullWidthPane>
    );
}
