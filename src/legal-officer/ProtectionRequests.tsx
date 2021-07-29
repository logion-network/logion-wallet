import React, { useState } from 'react';

import Tabs from '../common/Tabs';
import { FullWidthPane } from '../common/Dashboard';
import Frame from '../common/Frame';

import { useLegalOfficerContext } from './LegalOfficerContext';
import PendingProtectionRequests from './PendingProtectionRequests';
import ProtectionRequestsHistory from './ProtectionRequestsHistory';
import ProtectedUsers from "./ProtectedUsers";

import './ProtectionRequests.css';

export default function ProtectionRequests() {
    const { colorTheme } = useLegalOfficerContext();
    const [ tabKey, setTabKey ] = useState<string>('pending');

    return (
        <FullWidthPane
            className="ProtectionRequests"
            mainTitle="Protection management"
            titleIcon={{
                icon: {
                    id: 'shield',
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
                            render: () => <PendingProtectionRequests recovery={ false } />
                        },
                        {
                            key: "history",
                            title: "History",
                            render: () => <ProtectionRequestsHistory recovery={ false } />
                        }
                    ]}
                    colors={ colorTheme.tabs }
                />

                <h2>Activated User Account Protection under my watch</h2>
                <Frame
                        colors={colorTheme}
                >
                    <ProtectedUsers/>
                </Frame>
        </FullWidthPane>
    );
}
