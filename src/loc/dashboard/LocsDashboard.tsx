import { UUID, LocType } from '@logion/node-api';
import { useState } from 'react';
import { Col, Row } from 'react-bootstrap';

import { FullWidthPane } from '../../common/Dashboard';
import Tabs from '../../common/Tabs';
import Frame from '../../common/Frame';
import { useCommonContext } from "../../common/CommonContext";
import NetworkWarning from '../../common/NetworkWarning';
import WorkInProgressLocs from './WorkInProgressLocs';

import "./LocsDashboard.css";
import WaitingLocs from './WaitingLocs';
import CompletedLocs from './CompletedLocs';
import Loader from 'src/common/Loader';
import { Locs } from '../Locs';

export interface Props {
    iconId: string;
    title: string;
    actions: React.ReactNode;
    settingsPath: string;
    loading: boolean;
    locs: Locs;
    locDetailsPath: (locId: string | UUID, locType: LocType) => string;
}

export default function LocsDashboard(props: Props) {
    const { colorTheme, nodesDown } = useCommonContext();
    const [ locTabKey, setLocTabKey ] = useState<string>('workInProgress');

    return (
        <FullWidthPane
            mainTitle={ props.title }
            titleIcon={{
                icon: {
                    id: props.iconId
                },
                background: colorTheme.topMenuItems.iconGradient,
            }}
            className="LocsDashboard"
        >
            {
                nodesDown.length > 0 &&
                <Row>
                    <Col>
                        <NetworkWarning settingsPath={ props.settingsPath } />
                    </Col>
                </Row>
            }
            {
                props.loading &&
                <Loader />
            }
            {
                !props.loading &&
                <Row>
                    <Col>
                        <Frame>
                            <Tabs
                                activeKey={ locTabKey }
                                onSelect={ key => setLocTabKey(key || 'workInProgress') }
                                tabs={[
                                    {
                                        key: "workInProgress",
                                        title: "Work in progress",
                                        render: () => <WorkInProgressLocs
                                            locs={ props.locs.workInProgress }
                                            locDetailsPath={ props.locDetailsPath }
                                        />,
                                    },
                                    {
                                        key: "waiting",
                                        title: "Waiting",
                                        render: () => <WaitingLocs
                                            locs={ props.locs.waiting }
                                            locDetailsPath={ props.locDetailsPath }
                                        />,
                                    },
                                    {
                                        key: "completed",
                                        title: "Completed",
                                        render: () => <CompletedLocs
                                            locs={ props.locs.completed }
                                            locDetailsPath={ props.locDetailsPath }
                                        />,
                                    },
                                ] }
                            />
                            <div className="action-bar">
                                { props.actions }
                            </div>
                        </Frame>
                    </Col>
                </Row>
            }
        </FullWidthPane>
    );
}
