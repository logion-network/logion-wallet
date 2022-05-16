import { useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { DataLocType } from "@logion/node-api/dist/Types";

import { FullWidthPane } from '../../common/Dashboard';
import Tabs from '../../common/Tabs';
import { useCommonContext } from '../../common/CommonContext';
import Frame from '../../common/Frame';

import PendingLocRequests from './PendingLocRequests';
import RejectedLocRequests from './RejectedLocRequests';
import OpenedLocs from './OpenedLocs';
import ClosedLocs from './ClosedLocs';
import VoidLocs from './VoidLocs';

export interface Props {
    locType: DataLocType,
    titles: { main: string, loc: string, request: string },
    iconId: string
}

export default function TransactionProtection(props: Props) {
    const { colorTheme } = useCommonContext();
    const [ locTabKey, setLocTabKey ] = useState<string>('open');
    const [ requestTabKey, setRequestTabKey ] = useState<string>('pending');
    const { locType, titles, iconId } = props;

    return (
        <FullWidthPane
            mainTitle={ titles.main }
            titleIcon={ {
                icon: {
                    id: iconId
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
            className="TransactionProtection"
        >
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
                            ]}
                        />
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
                            tabs={ [
                                {
                                    key: "pending",
                                    title: "Pending",
                                    render: () => <PendingLocRequests locType={ locType } />
                                },
                                {
                                    key: "rejected",
                                    title: "Rejected",
                                    render: () => <RejectedLocRequests locType={ locType } />
                                }
                            ]}
                        />
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    );
}
