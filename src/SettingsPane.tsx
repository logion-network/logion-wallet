import { FullWidthPane } from './common/Dashboard';
import Frame from './common/Frame';
import { useCommonContext } from './common/CommonContext';

import { useLogionChain } from './logion-chain';
import { NodeMetadata } from './logion-chain/Connection';
import { useVersionContext } from './version/VersionContext';

import './SettingsPane.css';
import Alert from './common/Alert';

function status(metadata: NodeMetadata | null): string {
    if(metadata !== null) {
        return `connected to node "${metadata.name}" (Peer ID: ${metadata.peerId})`;
    } else {
        return "connecting";
    }
}

export default function SettingsPane() {
    const { connectedNodeMetadata } = useLogionChain();
    const { colorTheme, nodesDown } = useCommonContext();
    const { currentVersion, latestVersion } = useVersionContext();

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
                <p>You are currently {status(connectedNodeMetadata)}</p>
                {
                    nodesDown.length > 0 &&
                    <>
                        <p className="wrong-version">The following logion nodes are temporarily unavailable:</p>
                        <ul className="wrong-version">
                        { nodesDown.map(node => <li key={ node.peerId }>{ node.name }</li>) }
                        </ul>
                    </>
                }
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
