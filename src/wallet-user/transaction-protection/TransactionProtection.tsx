import React, { useState } from 'react';

import { FullWidthPane } from '../../common/Dashboard';
import Tabs from '../../common/Tabs';

import { useCommonContext } from "../../common/CommonContext";
import RequestedLocs from './RequestedLocs';
import LocsHistory from './LocsHistory';

export default function TransactionProtection() {
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
                        render: () => <RequestedLocs/>
                    },
                    {
                        key: "history",
                        title: "History",
                        render: () => <LocsHistory/>
                    }
                ]}
            />
        </FullWidthPane>
    );
}
