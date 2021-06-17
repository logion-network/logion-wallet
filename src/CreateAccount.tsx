import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import LandingPage from './LandingPage';

export default function CreateAccount() {
    return (
        <LandingPage>
            <Row>
                <Col>
                    <h1>2. Create an account with the extension in order to use the wallet</h1>
                </Col>
            </Row>
        </LandingPage>
    );
}
