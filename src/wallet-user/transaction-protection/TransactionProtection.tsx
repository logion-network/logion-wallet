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
import VoidLocs from './VoidLocs';
import NetworkWarning from '../../common/NetworkWarning';
import { SETTINGS_PATH } from '../UserRouter';
import { DataLocType } from "../../logion-chain/Types";

export interface Props {
    locType: DataLocType,
    titles: { main: string, loc: string, request: string },
    iconId: string,
    requestButtonLabel: string
}

export default function TransactionProtection(props: Props) {
    const { colorTheme, nodesDown } = useCommonContext();
    const [ locTabKey, setLocTabKey ] = useState<string>('open');
    const [ requestTabKey, setRequestTabKey ] = useState<string>('pending');
    const { locType, titles, iconId, requestButtonLabel } = props;

    return (
        <FullWidthPane
            mainTitle={ titles.main }
            titleIcon={{
                icon: {
                    id: iconId
                },
                background: colorTheme.topMenuItems.iconGradient,
            }}
            className="TransactionProtection"
        >
            {
                nodesDown.length > 0 &&
                <Row>
                    <Col>
                        <NetworkWarning settingsPath={ SETTINGS_PATH } />
                    </Col>
                </Row>
            }
            <Row>
                <Col>
                    <Frame
                        title={ titles.loc }
                    >
                        <Tabs
                            activeKey={ locTabKey }
                            onSelect={ key => setLocTabKey(key || 'open') }
                            tabs={[
                                {
                                    key: "open",
                                    title: "Open",
                                    render: () => <OpenedLocs locType={ locType } />
                                },
                                {
                                    key: "closed",
                                    title: "Closed",
                                    render: () => <ClosedLocs locType={ locType } />
                                },
                                {
                                    key: "void",
                                    title: "Void",
                                    render: () => <VoidLocs locType={ locType } />
                                }
                            ] }
                        />
                        <div className="action-bar">
                            <LocCreation locType={ locType } requestButtonLabel={ requestButtonLabel } />
                        </div>
                    </Frame>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Frame
                        title={ titles.request }
                    >
                        <Tabs
                            activeKey={ requestTabKey }
                            onSelect={ key => setRequestTabKey(key || 'pending') }
                            tabs={[
                                {
                                    key: "pending",
                                    title: "Pending",
                                    render: () => <RequestedLocs locType={ locType } />
                                },
                                {
                                    key: "rejected",
                                    title: "Rejected",
                                    render: () => <RejectedLocs locType={ locType } />
                                }
                            ]}
                        />
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    );
}
