import React from 'react';
import { useLogionChain, isExtensionAvailable } from './logion-chain';

import Wallet from './Wallet';
import Loader from './Loader';
import InstallExtension from './InstallExtension';
import CreateAccount from './CreateAccount';

export default function Main() {
    const { injectedAccounts } = useLogionChain();

    if(isExtensionAvailable()) {
        if(injectedAccounts === null) {
            return <Loader text="Loading accounts from extension..." />;
        } else {
            if(injectedAccounts.length > 0) {
                return <Wallet />;
            } else {
                return <CreateAccount />;
            }
        }
    } else {
        return <InstallExtension />;
    }
}
