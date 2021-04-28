import React from 'react';
import { Container, Grid, Button } from 'semantic-ui-react';
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
            <Grid>
                <Grid.Row>
                    <Grid.Column>
                        <Logo />
                        <p>You are ready to use the Logion wallet, congratulations!</p>
                        <p>The following accounts were detected:</p>
                        <ul>
                            {injectedAccounts.map(injectedAccount => <li key={injectedAccount.address}>{injectedAccount.address} ({injectedAccount.meta.name || ""})</li>)}
                        </ul>
                        <p>You are currently {status(apiState)}</p>
                        {connectButton}
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Container>
    );
}
