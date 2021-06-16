import React from 'react';
import Button from 'react-bootstrap/Button';

import { ContentPane } from '../component/Dashboard';
import Frame from '../component/Frame';

import { useLogionChain, ApiState, NodeMetadata } from '../logion-chain';
import { useUserContext } from './UserContext';

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

export default function Settings() {
    const { apiState, connect, connectedNodeMetadata } = useLogionChain();
    const { addresses, setUserAddress, colorTheme } = useUserContext();

    if(addresses === null || setUserAddress === null) {
        return null;
    }

    const connectButton = apiState === 'DISCONNECTED' ? <Button onClick={connect}>Connect</Button> : null;

    return (
        <ContentPane
            addresses={ addresses }
            selectAddress={ setUserAddress }
            colors={ colorTheme }
            primaryAreaChildren={
                <>
                    <h1>Settings</h1>
                    <Frame
                        colors={ colorTheme.frame }
                    >
                        <h2>You are ready to use the Logion wallet, congratulations!</h2>
                        <p>You are currently {status(apiState, connectedNodeMetadata)}</p>
                        {connectButton}
                    </Frame>
                </>
            }
        />
    );
}
