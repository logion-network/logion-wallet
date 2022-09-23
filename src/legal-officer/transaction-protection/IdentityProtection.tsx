import React, { useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { FullWidthPane } from '../../common/Dashboard';
import Tabs from '../../common/Tabs';

import { useCommonContext } from '../../common/CommonContext';
import OpenedLocs from './OpenedLocs';
import ClosedLocs from './ClosedLocs';
import Frame from '../../common/Frame';

import './IdentityProtection.css';
import VoidLocs from './VoidLocs';
import Button from '../../common/Button';
import LocCreationDialog from '../../loc/LocCreationDialog';
import { useNavigate } from 'react-router-dom';
import { identityLocDetailsPath } from '../LegalOfficerPaths';
import PendingLocRequests from "./PendingLocRequests";
import RejectedLocRequests from "./RejectedLocRequests";

export default function IdentityProtection() {
    const { colorTheme } = useCommonContext();
    const [ polkadotLocTabKey, setPolkadotLocTabKey ] = useState('open');
    const [ logionLocTabKey, setLogionLocTabKey ] = useState('open');
    const [ createLoc, setCreateLoc ] = useState(false);
    const navigate = useNavigate();
    const [ requestTabKey, setRequestTabKey ] = useState<string>('pending');

    return (
        <FullWidthPane
            mainTitle="Identity Case Management"
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
                            onSelect={ key => setPolkadotLocTabKey(key || 'open') }
                            tabs={[
                                {
                                    key: "open",
                                    title: "Open",
                                    render: () => <OpenedLocs locType="Identity" identityLocType="Polkadot" />
                                },
                                {
                                    key: "closed",
                                    title: "Closed",
                                    render: () => <ClosedLocs locType="Identity" identityLocType="Polkadot" />
                                },
                                {
                                    key: "void",
                                    title: "Void",
                                    render: () => <VoidLocs locType="Identity" identityLocType="Polkadot" />
                                }
                            ]}
                        />
                    </Frame>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Frame
                        title="Polkadot Identity LOC Request(s)"
                    >
                        <Tabs
                            activeKey={ requestTabKey }
                            onSelect={ key => setRequestTabKey(key || 'pending') }
                            tabs={ [
                                {
                                    key: "pending",
                                    title: "Pending",
                                    render: () => <PendingLocRequests locType="Identity" />
                                },
                                {
                                    key: "rejected",
                                    title: "Rejected",
                                    render: () => <RejectedLocRequests locType="Identity" />
                                }
                            ]}
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
                            onSelect={ key => setLogionLocTabKey(key || 'open') }
                            tabs={[
                                {
                                    key: "open",
                                    title: "Open",
                                    render: () => <OpenedLocs locType="Identity" identityLocType="Logion" />
                                },
                                {
                                    key: "closed",
                                    title: "Closed",
                                    render: () => <ClosedLocs locType="Identity" identityLocType="Logion" />
                                },
                                {
                                    key: "void",
                                    title: "Void",
                                    render: () => <VoidLocs locType="Identity" identityLocType="Logion" />
                                }
                            ]}
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
