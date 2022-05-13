import { Col, Row } from 'react-bootstrap';
import { FullWidthPane } from '../common/Dashboard';
import Frame from '../common/Frame';
import { useCommonContext } from '../common/CommonContext';

import { useLogionChain } from '../logion-chain';
import { NodeMetadata } from '../logion-chain/Connection';
import { useVersionContext } from '../version/VersionContext';

import './SettingsPane.css';
import Alert from '../common/Alert';
import DirectoryData from '../settings/DirectoryData';

function status(metadata: NodeMetadata | null): string {
    if(metadata !== null) {
        return `connected to node ${metadata.peerId}`;
    } else {
        return "connecting";
    }
}

export interface Props {
    showContactInformation: boolean;
}

export default function SettingsPane(props: Props) {
    const { connectedNodeMetadata, getOfficer } = useLogionChain();
    const { colorTheme, nodesDown } = useCommonContext();
    const { currentVersion, latestVersion } = useVersionContext();

    if(getOfficer === undefined) {
        return null;
    }

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
            {
                props.showContactInformation &&
                <Row>
                    <Col>
                        <Frame
                            title="Directory data"
                        >
                            <DirectoryData />
                        </Frame>
                    </Col>
                </Row>
            }
            <Row>
                <Col>
                    <Frame
                        title="Connection status"
                    >
                        <p>You are currently {status(connectedNodeMetadata)}</p>
                        {
                            nodesDown.length > 0 &&
                            <>
                                <p className="wrong-version">The following logion nodes are temporarily unavailable:</p>
                                <ul className="wrong-version">
                                {
                                    nodesDown.map(endpoint => getOfficer(endpoint.url)).filter(legalOfficer => legalOfficer !== null).map(legalOfficer =>
                                        <li key={ legalOfficer!.address }>{ legalOfficer!.name }</li>
                                    )
                                }
                                </ul>
                            </>
                        }
                    </Frame>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Frame
                        title="App version"
                        className="app"
                    >
                        {
                            latestVersion !== undefined && currentVersion !== latestVersion?.version &&
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
                </Col>
            </Row>
        </FullWidthPane>
    );
}
