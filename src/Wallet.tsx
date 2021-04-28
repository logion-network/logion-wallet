import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useLogionChain, ApiState } from './logion-chain';

import Logo from './Logo';

function status(apiState: ApiState): string {
    if(apiState === 'READY') {
        return "connected";
    } else if(apiState === 'DISCONNECTED') {
        return "disconnected";
    } else if(apiState === 'ERROR') {
        return "disconnected (error)";
    } else {
        return "connecting";
    }
}

export default function Wallet() {
    const { injectedAccounts, apiState, connect } = useLogionChain();

    const connectButton = apiState === 'DISCONNECTED' ? <Button onClick={connect}>Connect</Button> : null;

    return (
        <Container>
            <Row>
                <Col>
                    <Logo />
                    <p>You are ready to use the Logion wallet, congratulations!</p>
                    <p>The following accounts were detected:</p>
                    <ul>
                        {injectedAccounts.map(injectedAccount => <li key={injectedAccount.address}>{injectedAccount.address} ({injectedAccount.meta.name || ""})</li>)}
                    </ul>
                    <p>You are currently {status(apiState)}</p>
                    {connectButton}
                </Col>
            </Row>
        </Container>
    );
}
