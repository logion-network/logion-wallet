import React from 'react';
import { useLogionChain, isExtensionAvailable } from './logion-chain';

import RootRouter from './RootRouter';
import Loader from './Loader';
import InstallExtension from './InstallExtension';
import CreateAccount from './CreateAccount';

export default function Main() {
    const { injectedAccounts, extensionsEnabled } = useLogionChain();

    if(!extensionsEnabled) {
        return <Loader text="Enabling extensions..." />;
    } else {
        if(isExtensionAvailable()) {
            if(injectedAccounts === null) {
                return <Loader text="Loading accounts from extension..." />;
            } else {
                if(injectedAccounts.length > 0) {
                    return <RootRouter />
                } else {
                    return <CreateAccount />;
                }
            }
        } else {
            return <InstallExtension />;
        }
    }
}
