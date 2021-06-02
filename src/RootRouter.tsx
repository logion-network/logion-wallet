import React from 'react';
import {
    BrowserRouter as Router,
    Redirect,
    Switch,
    Route
} from 'react-router-dom';

import { useLogionChain, InjectedAccountWithMeta } from './logion-chain';

import { DEFAULT_LEGAL_OFFICER } from './legal-officer/Model';
import LegalOfficerWallet from './legal-officer/LegalOfficerWallet';
import Wallet from './wallet-user/Wallet';

const LEGAL_OFFICERS: string[] = [ DEFAULT_LEGAL_OFFICER ];

function includesLegalOfficer(accounts: InjectedAccountWithMeta[]): boolean {
    return accounts
        .map(account => account.address)
        .filter(address => LEGAL_OFFICERS.includes(address)).length > 0;
}

const LEGAL_OFFICER_PATH = "/legal-officer";
const WALLET_USER_PATH = "/wallet-user";

export default function RootRouter() {
    const { injectedAccounts } = useLogionChain();

    if(injectedAccounts === null || injectedAccounts.length <= 0) {
        return null;
    }

    const isLegalOfficer = includesLegalOfficer(injectedAccounts);
    let redirectTo;
    if(isLegalOfficer) {
        redirectTo = LEGAL_OFFICER_PATH;
    } else {
        redirectTo = WALLET_USER_PATH;
    }

    return (
        <Router>
            <Switch>
                <Route path={ LEGAL_OFFICER_PATH }>
                    { isLegalOfficer ? <LegalOfficerWallet /> : <Redirect to={ WALLET_USER_PATH } /> }
                </Route>
                <Route path={ WALLET_USER_PATH }>
                    { !isLegalOfficer ? <Wallet /> : <Redirect to={ LEGAL_OFFICER_PATH } /> }
                </Route>
                <Route path="/">
                    <Redirect to={ redirectTo } />
                </Route>
            </Switch>
        </Router>
    );
}
