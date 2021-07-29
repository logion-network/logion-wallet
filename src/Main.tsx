import React from 'react';
import { useLogionChain } from './logion-chain';
import { isExtensionAvailable } from './logion-chain/Keys';

import RootRouter from './RootRouter';
import Loader from './Loader';
import InstallExtension from './InstallExtension';
import CreateAccount from './CreateAccount';
import { CommonContextProvider } from './common/CommonContext';

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
                    return (
                        <CommonContextProvider>
                            <RootRouter />
                        </CommonContextProvider>
                    );
                } else {
                    return <CreateAccount />;
                }
            }
        } else {
            return <InstallExtension />;
        }
    }
}
