import React from 'react';
import Button from 'react-bootstrap/Button';

import { FullWidthPane } from './component/Dashboard';
import { ColorTheme } from './component/ColorTheme';
import Frame from './component/Frame';

import { useLogionChain, ApiState, NodeMetadata } from './logion-chain';

import { useRootContext } from './RootContext';

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

export interface Props {
    colors: ColorTheme,
}

export default function Settings(props: Props) {
    const { selectAddress, addresses } = useRootContext();
    const { apiState, connect, connectedNodeMetadata } = useLogionChain();

    if(addresses === null || selectAddress === null) {
        return null;
    }

    const connectButton = apiState === 'DISCONNECTED' ? <Button onClick={connect}>Connect</Button> : null;

    return (
        <FullWidthPane
            mainTitle="Settings"
            colors={ props.colors }
            addresses={ addresses }
            selectAddress={ selectAddress }
        >
            <Frame
                colors={ props.colors }
            >
                <h2>You are ready to use the Logion wallet, congratulations!</h2>
                <p>You are currently {status(apiState, connectedNodeMetadata)}</p>
                {connectButton}
            </Frame>
        </FullWidthPane>
    );
}
