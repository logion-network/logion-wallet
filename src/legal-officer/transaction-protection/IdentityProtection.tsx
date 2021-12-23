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
import Icon from '../../common/Icon';
import Button from '../../common/Button';

import './IdentityProtection.css';
import LocCreationDialog from './LocCreationDialog';
import { useNavigate } from 'react-router-dom';
import { locDetailsPath } from '../LegalOfficerPaths';

export default function IdentityProtection() {
    const { colorTheme } = useCommonContext();
    const [ polkadotLocTabKey, setPolkadotLocTabKey ] = useState('open');
    const [ logionLocTabKey, setLogionLocTabKey ] = useState('open');
    const [ createLoc, setCreateLoc ] = useState(false);
    const navigate = useNavigate();

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
                        title="Logion Identity LOC"
                    >
                        <Button
                            onClick={ () => setCreateLoc(true) }
                            className="add-identity-loc-button"
                        >
                            <Icon icon={{id: "add"}}/> Create a Logion ID
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
                            onSuccess={ request => navigate(locDetailsPath(request.id)) }
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
