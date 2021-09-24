import React, { useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { FullWidthPane } from '../../common/Dashboard';
import Tabs from '../../common/Tabs';

import { useCommonContext } from '../../common/CommonContext';
import PendingLocRequests from './PendingLocRequests';
import LocRequestsHistory from './LocRequestsHistory';
import OpenedLocs from '../../wallet-user/transaction-protection/OpenedLocs';
import Frame from '../../common/Frame';

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
            <Row>
                <Col>
                    <Frame
                        title="Open Transaction Protection Case(s)"
                    >
                        <OpenedLocs/>
                    </Frame>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Frame
                        title="Transaction Protection Case Request(s)"
                    >
                        <Tabs
                            activeKey={ tabKey }
                            onSelect={ key => setTabKey(key || 'pending') }
                            tabs={[
                                {
                                    key: "pending",
                                    title: "Pending",
                                    render: () => <PendingLocRequests/>
                                },
                                {
                                    key: "rejected",
                                    title: "Rejected",
                                    render: () => <LocRequestsHistory/>
                                }
                            ]}
                        />
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    );
}
