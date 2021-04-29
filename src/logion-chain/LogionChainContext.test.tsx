jest.mock('@polkadot/api');
jest.mock('@polkadot/ui-keyring');
jest.mock('@polkadot/extension-dapp');

import { useLogionChain, LogionChainContextProvider } from './LogionChainContext';
import { act, render, waitFor } from '@testing-library/react';
import { ConfigType, DEFAULT_CONFIG } from '../config';

import { triggerEvent } from '@polkadot/api';

test('Context automatically connects to first available node', async () => {
    const result = render(<InspectorInContext/>);
    expect(result.getByTestId("apiState")).toHaveTextContent("CONNECT_INIT");

    act(() => triggerEvent("connected"));
    act(() => triggerEvent("ready"));
    await waitFor(() => {}); // Solves act(...) warning

    expect(result.getByTestId("apiState")).toHaveTextContent("READY");
    expect(result.getByTestId("selectedNode.name")).toHaveTextContent("name");
    expect(result.getByTestId("selectedNode.socket")).toHaveTextContent("address");
    expect(result.getByTestId("selectedNode.peerId")).toHaveTextContent("peerId");
    expect(result.getByTestId("connectedNodeMetadata.name")).toHaveTextContent("Mock node");
    expect(result.getByTestId("connectedNodeMetadata.peerId")).toHaveTextContent("Mock peer ID");
    expect(result.getByTestId("lastHeader.number")).toHaveTextContent("42");
    expect(result.getByTestId("events.length")).toHaveTextContent("1");
});

function InspectorInContext() {
    const config: ConfigType = {
        ...DEFAULT_CONFIG,
        availableNodes: [
            {
                name: "name",
                socket: "address",
                peerId: "peerId"
            }
        ]
    };
    return (
        <LogionChainContextProvider config={config}>
            <LogionContextInspector />
        </LogionChainContextProvider>
    );
}

function LogionContextInspector() {
    const { apiState, connectedNodeMetadata, lastHeader, events, selectedNode } = useLogionChain();
    return (
        <div>
            <p data-testid="apiState">{apiState}</p>
            <p data-testid="selectedNode.name">{selectedNode ? selectedNode.name : ""}</p>
            <p data-testid="selectedNode.socket">{selectedNode ? selectedNode.socket : ""}</p>
            <p data-testid="selectedNode.peerId">{selectedNode ? selectedNode.peerId : ""}</p>
            <p data-testid="connectedNodeMetadata.name">{connectedNodeMetadata ? connectedNodeMetadata.name : ""}</p>
            <p data-testid="connectedNodeMetadata.peerId">{connectedNodeMetadata ? connectedNodeMetadata.peerId : ""}</p>
            <p data-testid="lastHeader.number">{lastHeader ? lastHeader.number.toNumber() : ""}</p>
            <p data-testid="events.length">{events.length}</p>
        </div>
    );
}
