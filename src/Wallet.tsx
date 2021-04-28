import React from 'react';
import { Container, Grid } from 'semantic-ui-react';
import { useLogionChain } from './logion-chain';

import Logo from './Logo';

export default function Wallet() {
    const { injectedAccounts } = useLogionChain();

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
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Container>
    );
}
