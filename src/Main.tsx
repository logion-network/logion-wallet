import React from 'react';
import { useLogionChain, isExtensionAvailable } from './logion-chain';

import Wallet from './Wallet';
import InstallExtension from './InstallExtension';
import CreateAccount from './CreateAccount';

export default function Main() {
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
