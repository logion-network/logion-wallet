import React from 'react';
import { useLogionChain, isExtensionAvailable } from './logion-chain';

import Wallet from './Wallet';
import InstallExtension from './InstallExtension';
import CreateAccount from './CreateAccount';

export default function Main() {
    const { injectedAccounts } = useLogionChain();

    if(isExtensionAvailable() && injectedAccounts.length > 0) {
        return <Wallet />;
    } else if(isExtensionAvailable() && injectedAccounts.length === 0) {
        return <CreateAccount />;
    } else {
        return <InstallExtension />;
    }
}
