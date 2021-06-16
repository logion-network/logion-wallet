import React from 'react';

import { useLogionChain } from '../logion-chain';

import Dashboard from '../component/Dashboard';
import Addresses from '../component/types/Addresses';
import UserRouter, { ACCOUNT_PATH, TRUST_PROTECTION_PATH, SETTINGS_PATH } from "./UserRouter";
import { useUserContext } from "./UserContext";

export default function ContextualizedWallet() {
    const { injectedAccounts, apiState } = useLogionChain();
    const { userAddress, setUserAddress, colorTheme } = useUserContext();

    if(injectedAccounts === null || setUserAddress === null) {
        return null;
    }

    const userContext = apiState === 'READY' ? <UserRouter /> : null;
    const addresses: Addresses = {
        currentAddress: {
            name: injectedAccounts.filter(injectedAccount => injectedAccount.address === userAddress)[0].meta.name!,
            address: userAddress,
        },
        addresses: injectedAccounts.map(injectedAccount => { return {
            name: injectedAccount.meta.name!,
            address: injectedAccount.address,
        };})
    };

    return (
        <Dashboard
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ setUserAddress }
            menuTop={[
                {
                    text: "Tokens",
                    to: ACCOUNT_PATH,
                    exact: true,
                    iconGradient: {
                        from: '#3b6cf4',
                        to: '#6050dc',
                    },
                }
            ]}
            shieldItem={{
                text: "My Logion Trust Protection",
                to: TRUST_PROTECTION_PATH,
                exact: true
            }}
            menuBottom={[
                {
                    text: "Settings",
                    to: SETTINGS_PATH,
                    exact: true,
                    iconGradient: {
                        from: '#7a90cb',
                        to: '#3b6cf4',
                    },
                }
            ]}
        >
            {userContext}
        </Dashboard>
    );
}
