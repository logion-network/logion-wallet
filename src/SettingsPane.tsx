import Button from 'react-bootstrap/Button';

import { FullWidthPane } from './common/Dashboard';
import Frame from './common/Frame';
import { useCommonContext } from './common/CommonContext';

import { useLogionChain } from './logion-chain';
import { ApiState, NodeMetadata } from './logion-chain/Connection';
import { useVersionContext } from './version/VersionContext';

import './SettingsPane.css';
import Alert from './common/Alert';

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

export default function SettingsPane() {
    const { apiState, connect, connectedNodeMetadata } = useLogionChain();
    const { colorTheme } = useCommonContext();
    const { currentVersion, latestVersion } = useVersionContext();

    const connectButton = apiState === 'DISCONNECTED' ? <Button onClick={connect}>Connect</Button> : null;

    return (
        <FullWidthPane
            mainTitle="Settings"
            titleIcon={{
                icon: {
                    id: 'settings'
                },
                background: colorTheme.bottomMenuItems.iconGradient,
            }}
            className="SettingsPane"
        >
            <Frame
                title="Connection status"
            >
                <p>You are currently {status(apiState, connectedNodeMetadata)}</p>
                {connectButton}
            </Frame>
            <Frame
                title="App version"
                className="app"
            >
                {
                    currentVersion !== latestVersion?.version &&
                    <>
                        <p className="wrong-version"><strong>You are not using the latest version of logion: latest is {latestVersion?.version}, yours is { currentVersion }.</strong></p>
                        <p><strong>Please "hard-refresh" (i.e. clear your cache and refresh) the page now:</strong></p>
                        <ul>
                            <li>PC users: Ctrl-F5</li>
                            <li>Mac users: Cmd-Shift-R</li>
                        </ul>
                        <p><strong>You may also delete all app's data via the settings of your browser.</strong></p>
                    </>
                }
                {
                    currentVersion === latestVersion?.version &&
                    <Alert
                        variant="success"
                    >
                        <p><strong>You are using the latest version of logion: { currentVersion }.</strong></p>
                    </Alert>
                }
            </Frame>
        </FullWidthPane>
    );
}
