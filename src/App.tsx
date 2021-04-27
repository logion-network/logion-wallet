import React from 'react';
import { useLogionChain, LogionChainContextProvider, isExtensionAvailable } from './logion-chain';

import config from './config';

import Wallet from './Wallet';
import InstallExtension from './InstallExtension';
import CreateAccount from './CreateAccount';

function Main() {
    const { apiState, injectedAccounts } = useLogionChain();

    if (apiState === 'ERROR') {
        return <p>Error connecting API</p>;
    } else if (apiState !== 'READY') {
        return <p>Connecting API...</p>;
    }

    if(isExtensionAvailable() && injectedAccounts.length > 0) {
        return <Wallet />;
    } else if(isExtensionAvailable() && injectedAccounts.length === 0) {
        return <CreateAccount />;
    } else {
        return <InstallExtension />;
    }
}

export default function App() {
    return (
        <LogionChainContextProvider config={config}>
            <Main />
        </LogionChainContextProvider>
    );
}
