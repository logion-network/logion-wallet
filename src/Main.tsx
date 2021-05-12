import React from 'react';
import { useLogionChain, isExtensionAvailable, InjectedAccountWithMeta } from './logion-chain';

import Wallet from './Wallet';
import Loader from './Loader';
import InstallExtension from './InstallExtension';
import CreateAccount from './CreateAccount';
import LegalOfficerWallet from './legal-officer/LegalOfficerWallet';

const LEGAL_OFFICERS: string[] = [ "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" ];

function includesLegalOfficer(accounts: InjectedAccountWithMeta[]): boolean {
    return accounts
        .map(account => account.address)
        .filter(address => LEGAL_OFFICERS.includes(address)).length > 0;
}

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
                    if(includesLegalOfficer(injectedAccounts)) {
                        return <LegalOfficerWallet />;
                    } else {
                        return <Wallet />;
                    }
                } else {
                    return <CreateAccount />;
                }
            }
        } else {
            return <InstallExtension />;
        }
    }
}
