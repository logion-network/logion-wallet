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

export default function IdentityProtection() {
    const { colorTheme } = useCommonContext();
    const [ polkadotTabKey, setPolkadotTabKey ] = useState<string>('open');
    const [ logionTabKey, setLogionTabKey ] = useState<string>('open');

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
                            activeKey={ polkadotTabKey }
                            onSelect={ key => setPolkadotTabKey(key || 'open') }
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
                        <Tabs
                            activeKey={ logionTabKey }
                            onSelect={ key => setLogionTabKey(key || 'open') }
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
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    );
}
