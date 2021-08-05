import React from 'react';
import { useLogionChain } from './logion-chain';
import { isExtensionAvailable } from './logion-chain/Keys';

import RootRouter from './RootRouter';
import Loader from './Loader';
import LandingPage from './LandingPage';
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
                    return <LandingPage activeStep="create"/>;
                }
            }
        } else {
            return <LandingPage activeStep="install"/>;
        }
    }
}
