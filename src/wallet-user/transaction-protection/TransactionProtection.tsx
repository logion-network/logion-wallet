import { useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { LocType } from "@logion/node-api";

import { FullWidthPane } from '../../common/Dashboard';
import Tabs from '../../common/Tabs';
import Frame from '../../common/Frame';
import { useCommonContext } from "../../common/CommonContext";
import NetworkWarning from '../../common/NetworkWarning';

import { SETTINGS_PATH } from '../UserRouter';

import OpenedLocs from './OpenedLocs';
import RequestedLocs from './RequestedLocs';
import RejectedLocs from './RejectedLocs';
import ClosedLocs from './ClosedLocs';
import VoidLocs from './VoidLocs';

import './TransactionProtection.css';
import { Children } from "../../common/types/Helpers";
import DraftLocs from './DraftLocs';
import AcceptedLocs from "./AcceptedLocs";

export interface Props {
    locType: LocType,
    titles: { main: string, loc: string, request: string },
    iconId: string,
    actions: Children
}

export default function TransactionProtection(props: Props) {
    const { colorTheme, nodesDown } = useCommonContext();
    const [ locTabKey, setLocTabKey ] = useState<string>('open');
    const [ requestTabKey, setRequestTabKey ] = useState<string>('draft');
    const { locType, titles, iconId } = props;

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
                            { props.actions }
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
                                    key: "draft",
                                    title: "Draft",
                                    render: () => <DraftLocs locType={ locType } />
                                },
                                {
                                    key: "pending",
                                    title: "Pending",
                                    render: () => <RequestedLocs locType={ locType } />
                                },
                                {
                                    key: "accepted",
                                    title: "Accepted",
                                    render: () => <AcceptedLocs locType={ locType } />
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
