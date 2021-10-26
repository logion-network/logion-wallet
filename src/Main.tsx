import React from 'react';
import { useLogionChain } from './logion-chain';
import { isExtensionAvailable } from './logion-chain/Keys';

import RootRouter from './RootRouter';
import Loader from './Loader';
import LandingPage from './LandingPage';
import { CommonContextProvider } from './common/CommonContext';
import { Switch, BrowserRouter as Router, Route } from "react-router-dom";
import PublicRouter from "./PublicRouter";
import { PUBLIC_PATH } from "./PublicPaths";

export default function Main() {
    return (
        <Router>
            <Switch>
                <Route path={ PUBLIC_PATH }>
                    <PublicRouter />
                </Route>
                <AuthenticatedMain />
            </Switch>
        </Router>
    )
}

export function AuthenticatedMain() {
    const { injectedAccounts, extensionsEnabled } = useLogionChain();

    if (!extensionsEnabled) {
        return <Loader text="Enabling extensions..." />;
    } else {
        if (isExtensionAvailable()) {
            if (injectedAccounts === null) {
                return <Loader text="Loading accounts from extension..." />;
            } else {
                if (injectedAccounts.length > 0) {
                    return (
                        <CommonContextProvider>
                            <RootRouter />
                        </CommonContextProvider>
                    );
                } else {
                    return <LandingPage activeStep="create" />;
                }
            }
        } else {
            return <LandingPage activeStep="install" />;
        }
    }
}
