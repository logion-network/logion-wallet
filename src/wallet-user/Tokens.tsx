import React, { useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { FullWidthPane } from '../common/Dashboard';
import Frame from '../common/Frame';
import Tabs from '../common/Tabs';

import { useCommonContext } from "../common/CommonContext";
import MyTokens from './MyTokens';
import Tokenization from "./Tokenization";
import PendingTokenizationRequests from './PendingTokenizationRequests';
import TokenizationRequestsHistory from './TokenizationRequestsHistory';

export default function Tokens() {
    const { colorTheme } = useCommonContext();
    const [ tabKey, setTabKey ] = useState<string>('pending');

    return (
        <FullWidthPane
            mainTitle="Tokens"
            titleIcon={{
                icon: {
                    id: 'tokens'
                },
                background: colorTheme.topMenuItems.iconGradient,
            }}
        >
            <Row>
                <Col>
                    <Frame
                        title="My tokens"
                    >
                        <MyTokens />
                        <Tokenization/>
                    </Frame>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Frame
                        title="My requests"
                    >
                        <Tabs
                            activeKey={ tabKey }
                            onSelect={ key => setTabKey(key || 'pending') }
                            tabs={[
                                {
                                    key: "pending",
                                    title: "Pending",
                                    render: () => <PendingTokenizationRequests />
                                },
                                {
                                    key: "history",
                                    title: "History",
                                    render: () => <TokenizationRequestsHistory />
                                }
                            ]}
                        />
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    );
}
