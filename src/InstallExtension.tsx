 import React from 'react';
 import Jumbotron from 'react-bootstrap/Jumbotron';

import { recommendedExtension } from './logion-chain';
import Shell from './Shell';

export default function InstallExtension() {
    const extension = recommendedExtension();
    if(extension !== null) {
        return (
            <Shell>
                <Jumbotron>
                    <h1>Install the extension</h1>
                </Jumbotron>
                <p>Please install <a href={extension.url}>this browser extension</a> in order to store
                your accounts in a secure way. Once done, authorize the Logion wallet to access it
                and create or import an account.</p>
            </Shell>
        );
    } else {
        return (
            <Shell>
                <p>Your browser is currently not supported, please try with
                <a href="https://www.google.com/chrome/">Chrome</a> or
                <a href="https://www.mozilla.org/firefox/">Firefox</a></p>
            </Shell>
        );
    }
}
