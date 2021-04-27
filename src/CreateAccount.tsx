 import React from 'react';
import { Container, Grid } from 'semantic-ui-react';

import Logo from './Logo';

export default function Component() {
    return (
        <Container>
            <Grid>
                <Grid.Row>
                    <Grid.Column>
                        <Logo />
                        <p>Create an account with the extension in order to use the wallet</p>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Container>
    );
}
