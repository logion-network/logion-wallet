import React from 'react';
import { Switch, Route } from 'react-router-dom';

import {
    TOKENIZATION_REQUESTS_PATH,
    PROTECTION_REQUESTS_PATH,
    RECOVERY_REQUESTS_PATH,
    SETTINGS_PATH,
    RECOVERY_DETAILS_PATH,
    NFT_PATH,
    WALLET_PATH,
    transactionsPath,
    TRANSACTIONS_PATH,
} from './LegalOfficerPaths';

import Home from './Home';
import TokenizationRequests from './TokenizationRequests';
import ProtectionRequests from './ProtectionRequests';
import RecoveryRequests from './RecoveryRequests';
import Settings from './Settings';
import RecoveryDetails from "./RecoveryDetails";
import Nft from "./Nft";
import Wallet from "../common/Wallet";
import Transactions from "../common/Transactions";
import { useLegalOfficerContext } from "./LegalOfficerContext";

export default function LegalOfficerRouter() {
    const { colorTheme } = useLegalOfficerContext();

    return (
        <>
            <Switch>
                <Route path={ TOKENIZATION_REQUESTS_PATH }>
                    <TokenizationRequests />
                </Route>
                <Route path={ PROTECTION_REQUESTS_PATH }>
                    <ProtectionRequests />
                </Route>
                <Route path={ RECOVERY_REQUESTS_PATH }>
                    <RecoveryRequests />
                </Route>
                <Route path={ RECOVERY_DETAILS_PATH }>
                    <RecoveryDetails />
                </Route>
                <Route path={ SETTINGS_PATH }>
                    <Settings />
                </Route>
                <Route path={ NFT_PATH }>
                    <Nft />
                </Route>
                <Route path={ WALLET_PATH }>
                    <Wallet
                        transactionsPath={ transactionsPath }
                        colorTheme={ colorTheme }
                    />
                </Route>
                <Route path={ TRANSACTIONS_PATH }>
                    <Transactions
                        backPath={ WALLET_PATH }
                        colorTheme={ colorTheme }
                    />
                </Route>
                <Route path="">
                    <Home />
                </Route>
            </Switch>
        </>
    );
}
