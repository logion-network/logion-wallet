import React, { useState } from 'react';

import { FullWidthPane } from '../common/Dashboard';
import Tabs from '../common/Tabs';

import { useCommonContext } from '../common/CommonContext';
import PendingTokenizationRequests from './PendingTokenizationRequests';
import TokenizationRequestsHistory from './TokenizationRequestsHistory';

export default function TokenizationRequests() {
    const { colorTheme } = useCommonContext();
    const [ tabKey, setTabKey ] = useState<string>('pending');

    return (
        <FullWidthPane
            mainTitle="Tokens"
            titleIcon={{
                icon: {
                    id: 'tokens'
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
                        render: () => <PendingTokenizationRequests />
                    },
                    {
                        key: "history",
                        title: "History",
                        render: () => <TokenizationRequestsHistory />
                    }
                ]}
            />
        </FullWidthPane>
    );
}
