import React from 'react';
import Button from 'react-bootstrap/Button';
import Jumbotron from 'react-bootstrap/Jumbotron';
import { useLogionChain, ApiState } from './logion-chain';

import Shell from './Shell';

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
        <Shell>
            <Jumbotron>
                <h1>You are ready to use the Logion wallet, congratulations!</h1>
            </Jumbotron>

            <p>The following accounts were detected:</p>
            <ul>
                {injectedAccounts.map(injectedAccount => <li key={injectedAccount.address}>{injectedAccount.address} ({injectedAccount.meta.name || ""})</li>)}
            </ul>
            <p>You are currently {status(apiState)}</p>
            {connectButton}
        </Shell>
    );
}
