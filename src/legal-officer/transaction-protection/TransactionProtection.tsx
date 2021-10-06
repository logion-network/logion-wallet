import React, { useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { FullWidthPane } from '../../common/Dashboard';
import Tabs from '../../common/Tabs';

import { useCommonContext } from '../../common/CommonContext';
import PendingLocRequests from './PendingLocRequests';
import RejectedLocRequests from './RejectedLocRequests';
import OpenedLocs from './OpenedLocs';
import ClosedLocs from './ClosedLocs';
import Frame from '../../common/Frame';

export default function LocRequests() {
    const { colorTheme } = useCommonContext();
    const [ locTabKey, setLocTabKey ] = useState<string>('open');
    const [ requestTabKey, setRequestTabKey ] = useState<string>('pending');

    return (
        <FullWidthPane
            mainTitle="Transaction Protection Cases"
            titleIcon={ {
                icon: {
                    id: 'loc'
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
        >
            <Row>
                <Col>
                    <Frame
                        title="Transaction Protection Case(s)"
                    >
                        <Tabs
                            activeKey={ locTabKey }
                            onSelect={ key => setLocTabKey(key || 'open') }
                            tabs={[
                                {
                                    key: "open",
                                    title: "Open",
                                    render: () => <OpenedLocs />
                                },
                                {
                                    key: "closed",
                                    title: "Closed",
                                    render: () => <ClosedLocs />
                                }
                            ]} />
                    </Frame>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Frame
                        title="Transaction Protection Case Request(s)"
                    >
                        <Tabs
                            activeKey={ requestTabKey }
                            onSelect={ key => setRequestTabKey(key || 'pending') }
                            tabs={ [
                                {
                                    key: "pending",
                                    title: "Pending",
                                    render: () => <PendingLocRequests />
                                },
                                {
                                    key: "rejected",
                                    title: "Rejected",
                                    render: () => <RejectedLocRequests />
                                }
                            ]}
                        />
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    );
}
