import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Logo from './Logo';

export default function CreateAccount() {
    return (
        <Container>
            <Row>
                <Col>
                    <Logo />
                    <p>Create an account with the extension in order to use the wallet</p>
                </Col>
            </Row>
        </Container>
    );
}
