import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import Tabs from '../common/Tabs';
import { FullWidthPane } from '../common/Dashboard';
import Frame from '../common/Frame';

import PendingProtectionRequests from './PendingProtectionRequests';
import ProtectionRequestsHistory from './ProtectionRequestsHistory';
import ProtectedUsers from "./ProtectedUsers";

import './ProtectionRequests.css';
import { getQueryParam } from '../common/QueryString';

export default function ProtectionRequests() {
    const location = useLocation();
    const [ tabKey, setTabKey ] = useState<string>(getQueryParam(location, "tab") || "pending");

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
                            render: () => <ProtectionRequestsHistory />
                        }
                    ]}
                />

                <h2>Activated User Account Protection under my watch</h2>
                <Frame>
                    <ProtectedUsers/>
                </Frame>
        </FullWidthPane>
    );
}
