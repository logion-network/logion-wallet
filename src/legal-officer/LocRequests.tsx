import React, { useState } from 'react';

import { FullWidthPane } from '../common/Dashboard';
import Tabs from '../common/Tabs';

import { useCommonContext } from '../common/CommonContext';
import PendingLocRequests from './PendingLocRequests';
import LocRequestsHistory from './LocRequestsHistory';

export default function LocRequests() {
    const { colorTheme } = useCommonContext();
    const [ tabKey, setTabKey ] = useState<string>('pending');

    return (
        <FullWidthPane
            mainTitle="Transaction Protection"
            titleIcon={{
                icon: {
                    id: 'loc'
                },
                background: colorTheme.topMenuItems.iconGradient,
            }}
        >
            <Tabs
                activeKey={ tabKey }
                onSelect={ key => setTabKey(key || 'pending') }
                tabs={[
                    {
                        key: "pending",
                        title: "Pending",
                        render: () => <PendingLocRequests />
                    },
                    {
                        key: "history",
                        title: "History",
                        render: () => <LocRequestsHistory />
                    }
                ]}
            />
        </FullWidthPane>
    );
}
