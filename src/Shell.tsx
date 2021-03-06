import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Navbar from 'react-bootstrap/Navbar';

import Logo from './Logo';

import './Shell.css';

export interface Props {
    children: JSX.Element | (JSX.Element | null)[] | null,
    backgroundCss?: string
}

export default function Shell(props: Props) {
    let customStyle = undefined;
    if(props.backgroundCss !== undefined) {
        customStyle = {
            background: props.backgroundCss
        };
    }
    return (
        <div className="Shell" style={customStyle}>
            <Container>
                <div className="ShellHeader">
                    <Row>
                        <Col>
                            <Navbar>
                                <Navbar.Brand>
                                    <Logo size={50} />
                                </Navbar.Brand>
                            </Navbar>
                        </Col>
                    </Row>
                </div>
                <div className="ShellContent">
                    <Row>
                        <Col>
                            {props.children}
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    );
}
