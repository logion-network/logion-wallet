import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import Tabs from '../../common/Tabs';
import { FullWidthPane } from '../../common/Dashboard';

import PendingRecoveryRequests from './PendingRecoveryRequests';
import RecoveryRequestsHistory from './RecoveryRequestsHistory';
import './RecoveryRequests.css';
import { getQueryParam } from '../../common/QueryString';

export default function RecoveryRequests() {
    const location = useLocation();
    const [ tabKey, setTabKey ] = useState<string>(getQueryParam(location, "tab") || "pending");

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
                        render: () => <PendingRecoveryRequests />
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
