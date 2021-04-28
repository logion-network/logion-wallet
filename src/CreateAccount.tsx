import React from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';

import Shell from './Shell';

export default function CreateAccount() {
    return (
        <Shell>
            <Jumbotron>
                <h1>Create an account with the extension in order to use the wallet</h1>
            </Jumbotron>
        </Shell>
    );
}
