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

export default function IdentityProtection() {
    const { colorTheme } = useCommonContext();
    const [ locTabKey, setLocTabKey ] = useState<string>('open');

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
                        title="Identity Case(s)"
                        fullHeight
                    >
                        <Tabs
                            activeKey={ locTabKey }
                            onSelect={ key => setLocTabKey(key || 'open') }
                            tabs={[
                                {
                                    key: "open",
                                    title: "Open",
                                    render: () => <OpenedLocs locType="Identity" />
                                },
                                {
                                    key: "closed",
                                    title: "Closed",
                                    render: () => <ClosedLocs locType="Identity" />
                                }
                            ]} />
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    );
}
