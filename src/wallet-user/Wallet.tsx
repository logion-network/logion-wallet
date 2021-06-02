import React from 'react';
import Button from 'react-bootstrap/Button';
import { useLogionChain, ApiState, NodeMetadata } from '../logion-chain';

import Shell from '../Shell';
import Tokenization from "./Tokenization";
import {UserContextProvider} from "./UserContext";
import {DEFAULT_LEGAL_OFFICER} from "../legal-officer/Model";
import RefreshRequestsButton from './RefreshRequestsButton';
import PendingTokenizationRequests from './PendingTokenizationRequests';
import AcceptedTokenizationRequests from './AcceptedTokenizationRequests';
import RejectedTokenizationRequests from './RejectedTokenizationRequests';

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

export default function Wallet() {
    const { injectedAccounts, apiState, connect, connectedNodeMetadata } = useLogionChain();
    if(injectedAccounts === null) {
        return null;
    }

    const connectButton = apiState === 'DISCONNECTED' ? <Button onClick={connect}>Connect</Button> : null;
    const userContext = apiState === 'READY' ?
        <UserContextProvider legalOfficerAddress={DEFAULT_LEGAL_OFFICER} userAddress={injectedAccounts[0].address}>
            <Tokenization/>
            <RefreshRequestsButton/>
            <PendingTokenizationRequests />
            <AcceptedTokenizationRequests />
            <RejectedTokenizationRequests />
        </UserContextProvider> : null;

    return (
        <Shell>
            <h1>You are ready to use the Logion wallet, congratulations!</h1>

            <p>The following accounts were detected:</p>
            <ul>
                {injectedAccounts.map(injectedAccount => <li key={injectedAccount.address}>{injectedAccount.address} ({injectedAccount.meta.name || ""})</li>)}
            </ul>
            <p>You are currently {status(apiState, connectedNodeMetadata)}</p>
            {connectButton}
            {userContext}
        </Shell>
    );
}
