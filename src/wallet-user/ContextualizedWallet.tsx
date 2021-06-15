import React from 'react';
import Button from 'react-bootstrap/Button';

import { useLogionChain, ApiState, NodeMetadata } from '../logion-chain';

import Dashboard, { ColorTheme } from '../component/Dashboard';
import Addresses from '../component/types/Addresses';
import UserRouter, { ACCOUNT_PATH, TRUST_PROTECTION_PATH } from "./UserRouter";
import { useUserContext } from "./UserContext";

function status(apiState: ApiState, metadata: NodeMetadata | null): string {
    if(apiState === 'READY' && metadata === null) {
        return "connected";
    } else if(apiState === 'READY' && metadata !== null) {
        return `connected to node "${metadata.name}" (Peer ID: ${metadata.peerId})`;
    } else if(apiState === 'DISCONNECTED') {
        return "disconnected";
    } else if(apiState === 'ERROR') {
        return "disconnected (error)";
    } else {
        return "connecting";
    }
}

const USER_LIGHT_MODE: ColorTheme = {
    sidebar: {
        background: '#152665',
        foreground: '#ffffff',
    },
    primaryArea: {
        background: '#ffffff',
        foreground: '#000000',
        link: '#3b6cf466',
    },
    secondaryArea: {
        background: '#ffffff',
        foreground: '#000000',
    },
    accountColors: {
        iconBackground: '#3b6cf4',
        hintColor: '#00000066',
        textColor: '#000000',
    }
};

export default function ContextualizedWallet() {
    const { injectedAccounts, apiState, connect, connectedNodeMetadata } = useLogionChain();
    const { userAddress, setUserAddress } = useUserContext();

    if(injectedAccounts === null || setUserAddress === null) {
        return null;
    }

    const connectButton = apiState === 'DISCONNECTED' ? <Button onClick={connect}>Connect</Button> : null;
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
            title="User Wallet"
            colors={USER_LIGHT_MODE}
            addresses={ addresses }
            selectAddress={ setUserAddress }
            menu={
                [
                    {
                        text: "My Account",
                        to: ACCOUNT_PATH,
                        exact: true
                    },
                    {
                        text: "My Logion Trust Protection",
                        to: TRUST_PROTECTION_PATH,
                        exact: true
                    }
                ]
            }
        >
            <h2>You are ready to use the Logion wallet, congratulations!</h2>
            <p>You are currently {status(apiState, connectedNodeMetadata)}</p>
            {connectButton}
            {userContext}
        </Dashboard>
    );
}
