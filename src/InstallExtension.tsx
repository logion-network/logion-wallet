 import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { recommendedExtension } from './logion-chain';
import Logo from './Logo';

export default function InstallExtension() {
    const extension = recommendedExtension();
    if(extension !== null) {
        return (
            <Container>
                <Row>
                    <Col>
                        <Logo />
                        <p>Please install <a href={extension.url}>this browser extension</a> in order to store
                        your accounts in a secure way. Once done, authorize the Logion wallet to access it
                        and create or import an account.</p>
                    </Col>
                </Row>
            </Container>
        );
    } else {
        return (
            <p>Your browser is currently not supported, please try with
            <a href="https://www.google.com/chrome/">Chrome</a> or
            <a href="https://www.mozilla.org/firefox/">Firefox</a></p>
        );
    }
}
