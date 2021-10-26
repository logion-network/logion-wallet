import React, { useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { FullWidthPane } from '../../common/Dashboard';
import Tabs from '../../common/Tabs';
import Frame from '../../common/Frame';
import { useCommonContext } from "../../common/CommonContext";

import OpenedLocs from './OpenedLocs';
import RequestedLocs from './RequestedLocs';
import RejectedLocs from './RejectedLocs';
import LocCreation from './LocCreation';
import ClosedLocs from './ClosedLocs';

import './TransactionProtection.css';

export default function TransactionProtection() {
    const { colorTheme } = useCommonContext();
    const [ locTabKey, setLocTabKey ] = useState<string>('open');
    const [ requestTabKey, setRequestTabKey ] = useState<string>('pending');

    return (
        <FullWidthPane
            mainTitle="Transaction Protection"
            subTitle="Logion Officer Cases"
            titleIcon={{
                icon: {
                    id: 'loc'
                },
                background: colorTheme.topMenuItems.iconGradient,
            }}
            className="TransactionProtection"
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
                            ] }
                        />
                        <div className="action-bar">
                            <LocCreation />
                        </div>
                    </Frame>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Frame
                        title="Transaction Protection Request(s)"
                    >
                        <Tabs
                            activeKey={ requestTabKey }
                            onSelect={ key => setRequestTabKey(key || 'pending') }
                            tabs={[
                                {
                                    key: "pending",
                                    title: "Pending",
                                    render: () => <RequestedLocs/>
                                },
                                {
                                    key: "rejected",
                                    title: "Rejected",
                                    render: () => <RejectedLocs/>
                                }
                            ]}
                        />
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    );
}
