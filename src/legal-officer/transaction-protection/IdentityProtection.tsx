import { useMemo, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { FullWidthPane } from '../../common/Dashboard';
import Tabs from '../../common/Tabs';

import { useCommonContext } from '../../common/CommonContext';
import Frame from '../../common/Frame';

import './IdentityProtection.css';
import Button from '../../common/Button';
import LocCreationDialog from '../../loc/LocCreationDialog';
import { useNavigate } from 'react-router-dom';
import { identityLocDetailsPath, locDetailsPath } from '../LegalOfficerPaths';
import WorkInProgressLocs from 'src/loc/dashboard/WorkInProgressLocs';
import WaitingLocs from 'src/loc/dashboard/WaitingLocs';
import CompletedLocs from 'src/loc/dashboard/CompletedLocs';
import { useLegalOfficerContext } from '../LegalOfficerContext';

export default function IdentityProtection() {
    const { colorTheme } = useCommonContext();
    const [ polkadotLocTabKey, setPolkadotLocTabKey ] = useState('workInProgress');
    const [ logionLocTabKey, setLogionLocTabKey ] = useState('workInProgress');
    const [ createLoc, setCreateLoc ] = useState(false);
    const navigate = useNavigate();
    const { locs } = useLegalOfficerContext();

    const polkadotLocs = useMemo(() => {
        return locs.Identity.filter(loc => !loc.isLogionIdentity());
    }, [ locs ]);

    const logionLocs = useMemo(() => {
        return locs.Identity.filter(loc => loc.isLogionIdentity());
    }, [ locs ]);

    return (
        <FullWidthPane
            mainTitle="Identity LOCs"
            titleIcon={ {
                icon: {
                    id: 'identity'
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
            className="IdentityProtection"
        >
            <Row>
                <Col>
                    <Frame
                        title="Polkadot Identity LOC"
                    >
                        <Tabs
                            activeKey={ polkadotLocTabKey }
                            onSelect={ key => setPolkadotLocTabKey(key || 'workInProgress') }
                            tabs={[
                                {
                                    key: "workInProgress",
                                    title: "Work in progress",
                                    render: () => <WorkInProgressLocs
                                        locs={ polkadotLocs.workInProgress }
                                        locDetailsPath={ locDetailsPath }
                                    />,
                                },
                                {
                                    key: "waiting",
                                    title: "Waiting",
                                    render: () => <WaitingLocs
                                        locs={ polkadotLocs.waiting }
                                        locDetailsPath={ locDetailsPath }
                                    />,
                                },
                                {
                                    key: "completed",
                                    title: "Completed",
                                    render: () => <CompletedLocs
                                        locs={ polkadotLocs.completed }
                                        locDetailsPath={ locDetailsPath }
                                    />,
                                },
                            ] }
                        />
                    </Frame>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Frame
                        title="Logion Identity LOC"
                    >
                        <Button
                            onClick={ () => setCreateLoc(true) }
                            className="add-identity-loc-button"
                        >
                            Create a Logion ID
                        </Button>
                        <Tabs
                            activeKey={ logionLocTabKey }
                            onSelect={ key => setLogionLocTabKey(key || 'workInProgress') }
                            tabs={[
                                {
                                    key: "workInProgress",
                                    title: "Work in progress",
                                    render: () => <WorkInProgressLocs
                                        locs={ logionLocs.workInProgress }
                                        locDetailsPath={ locDetailsPath }
                                    />,
                                },
                                {
                                    key: "waiting",
                                    title: "Waiting",
                                    render: () => <WaitingLocs
                                        locs={ logionLocs.waiting }
                                        locDetailsPath={ locDetailsPath }
                                    />,
                                },
                                {
                                    key: "completed",
                                    title: "Completed",
                                    render: () => <CompletedLocs
                                        locs={ logionLocs.completed }
                                        locDetailsPath={ locDetailsPath }
                                    />,
                                },
                            ] }
                        />
                        <LocCreationDialog
                            show={ createLoc }
                            exit={ () => setCreateLoc(false) }
                            onSuccess={ request => navigate(identityLocDetailsPath(request.id.toString())) }
                            locRequest={{
                                locType: 'Identity'
                            }}
                            hasLinkNature={ false }
                        />
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    );
}
