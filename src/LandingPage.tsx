import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { Children } from './common/types/Helpers';

import Logo from './Logo';

import './LandingPage.css';

export interface Props {
    children: Children,
}

export default function LandingPage(props: Props) {

    return (
        <div className="LandingPage">
            <Container fluid>
                <Row>
                    <Col>
                        <div className="logo-slogan">
                            <Logo size={ 100 } />
                            <p>One blockchain <br/>to trust them all</p>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div className="messages">
                            <p className="primary-message">The secure blockchain</p>
                            <p className="secondary-message">accessible in two steps</p>
                        </div>
                    </Col>
                </Row>
                { props.children }
            </Container>
        </div>
    );
}
