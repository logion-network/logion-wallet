import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { USER_PATH } from '../RootPaths';

import Home from "./Home";
import Tokens from "./Tokens";
import Settings from "../Settings";
import TrustProtection from "./trust-protection/TrustProtection";
import Recovery from "./trust-protection/Recovery";
import Wallet from "../common/Wallet";
import Transactions from "../common/Transactions";

export const HOME_PATH = USER_PATH;
export const TOKENS_PATH = USER_PATH + '/tokens';
export const TRUST_PROTECTION_PATH = USER_PATH + '/protection';
export const SETTINGS_PATH = USER_PATH + '/settings';
export const RECOVERY_PATH = USER_PATH + '/recovery';
export const WALLET_PATH = USER_PATH + '/wallet';

const TRANSACTIONS_PATH = USER_PATH + '/transactions/:coinId';
export function transactionsPath(coinId: string): string {
    return TRANSACTIONS_PATH.replace(":coinId", coinId);
}

export default function UserRouter() {

    return (
        <>
            <Switch>
                <Route path={ TOKENS_PATH }>
                    <Tokens />
                </Route>
                <Route path={ TRUST_PROTECTION_PATH }>
                    <TrustProtection />
                </Route>
                <Route path={ SETTINGS_PATH }>
                    <Settings />
                </Route>
                <Route path={ RECOVERY_PATH }>
                    <Recovery />
                </Route>
                <Route path={ WALLET_PATH }>
                    <Wallet
                        transactionsPath={ transactionsPath }
                    />
                </Route>
                <Route path={ TRANSACTIONS_PATH }>
                    <Transactions
                        backPath={ WALLET_PATH }
                    />
                </Route>
                <Route path="">
                    <Home />
                </Route>
            </Switch>
        </>
    );
}
