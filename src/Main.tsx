import { useLogionChain } from './logion-chain';
import { isExtensionAvailable } from '@logion/extension';

import RootRouter from './RootRouter';
import Loader from './Loader';
import LandingPage from './landing/LandingPage';
import { CommonContextProvider } from './common/CommonContext';
import { Routes, BrowserRouter as Router, Route } from "react-router-dom";
import PublicRouter from "./PublicRouter";
import { PUBLIC_PATH } from "./PublicPaths";

export default function Main() {
    return (
        <Router>
            <Routes>
                <Route path={ PUBLIC_PATH + "/*" } element={ <PublicRouter /> } />
                <Route path="/*" element={ <AuthenticatedMain /> } />
            </Routes>
        </Router>
    )
}

export function AuthenticatedMain() {
    const { injectedAccounts, extensionsEnabled, accounts } = useLogionChain();

    if (!extensionsEnabled) {
        return <Loader text="Enabling extensions..." />;
    } else {
        if (accounts !== null && accounts.all.length > 0) {
            return (
                <CommonContextProvider>
                    <RootRouter />
                </CommonContextProvider>
            );
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
}
