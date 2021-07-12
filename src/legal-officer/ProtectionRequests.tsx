import React, { useState } from 'react';

import Tabs from '../component/Tabs';
import { FullWidthPane } from '../component/Dashboard';
import Frame from '../component/Frame';
import { useRootContext } from '../RootContext';

import { useLegalOfficerContext } from './LegalOfficerContext';
import PendingProtectionRequests from './PendingProtectionRequests';
import ProtectionRequestsHistory from './ProtectionRequestsHistory';
import ProtectedUsers from "./ProtectedUsers";

import './ProtectionRequests.css';

export default function ProtectionRequests() {
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme } = useLegalOfficerContext();
    const [ tabKey, setTabKey ] = useState<string>('pending');

    if(addresses === null || selectAddress === null) {
        return null;
    }

    return (
        <FullWidthPane
            className="ProtectionRequests"
            mainTitle="Protection requests"
            titleIcon={{
                id: 'shield',
                hasVariants: true,
            }}
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
