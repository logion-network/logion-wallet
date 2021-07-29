import React from 'react';
import Button from 'react-bootstrap/Button';

import { FullWidthPane } from './common/Dashboard';
import { ColorTheme } from './common/ColorTheme';
import Frame from './common/Frame';

import { useLogionChain } from './logion-chain';
import { ApiState, NodeMetadata } from './logion-chain/Connection';

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
    const { apiState, connect, connectedNodeMetadata } = useLogionChain();

    const connectButton = apiState === 'DISCONNECTED' ? <Button onClick={connect}>Connect</Button> : null;

    return (
        <FullWidthPane
            mainTitle="Settings"
            titleIcon={{
                icon: {
                    id: 'settings'
                },
                background: props.colors.bottomMenuItems.iconGradient,
            }}
            colors={ props.colors }
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
