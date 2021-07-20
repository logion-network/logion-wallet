 import React from 'react';
 import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { recommendedExtension } from './logion-chain/Keys';
import LandingPage from './LandingPage';

export default function InstallExtension() {
    const extension = recommendedExtension();
    if(extension !== null) {
        return (
            <LandingPage>
                <Row>
                    <Col>
                        <h1>1. Install the extension</h1>
                        <p>Please install <a href={extension.url}>this browser extension</a> in order to store
                        your accounts in a secure way. Once done, authorize the Logion wallet to access it
                        and create or import an account.</p>
                    </Col>
                </Row>
            </LandingPage>
        );
    } else {
        return (
            <LandingPage>
                <Row>
                    <Col>
                        <p>0. Your browser is currently not supported, please try with
                        <a href="https://www.google.com/chrome/">Chrome</a> or
                        <a href="https://www.mozilla.org/firefox/">Firefox</a></p>
                    </Col>
                </Row>
            </LandingPage>
        );
    }
}
