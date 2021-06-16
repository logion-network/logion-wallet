import React from 'react';

import { useLogionChain } from '../logion-chain';

import { UserContextProvider } from "./UserContext";
import ContextualizedWallet from './ContextualizedWallet';

export default function Wallet() {
    const { injectedAccounts } = useLogionChain();

    if(injectedAccounts === null) {
        return null;
    }

    return (
        <UserContextProvider>
            <ContextualizedWallet />
        </UserContextProvider>
    );
}
