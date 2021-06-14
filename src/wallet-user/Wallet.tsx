import React from 'react';

import { useLogionChain } from '../logion-chain';

import { UserContextProvider } from "./UserContext";
import { DEFAULT_LEGAL_OFFICER } from "../legal-officer/Types";
import ContextualizedWallet from './ContextualizedWallet';

export default function Wallet() {
    const { injectedAccounts } = useLogionChain();

    if(injectedAccounts === null) {
        return null;
    }

    return (
        <UserContextProvider legalOfficerAddress={DEFAULT_LEGAL_OFFICER} userAddress={injectedAccounts[0].address}>
            <ContextualizedWallet />
        </UserContextProvider>
    );
}
