jest.mock('@polkadot/api');
jest.mock('@polkadot/ui-keyring');
jest.mock('@polkadot/extension-dapp');

import { useLogionChain, LogionChainContextProvider } from './LogionChainContext';
import { render, waitFor, RenderResult } from '@testing-library/react';

import {
    teardown as teardownApi,
} from '../__mocks__/PolkadotApiMock';
import { updateInjectedAccounts, teardown as teardownExtensionDapp } from '../__mocks__/PolkadotExtensionDappMock';

afterEach(() => {
    teardownApi();
    teardownExtensionDapp();
});

function InspectorInContext() {
    return (
        <LogionChainContextProvider>
            <LogionContextInspector />
        </LogionChainContextProvider>
    );
}

function LogionContextInspector() {
    const {
        connectedNodeMetadata,
        injectedAccounts,
        injectedAccountsConsumptionState,
    } = useLogionChain();
    return (
        <div>
            <p data-testid="connectedNodeMetadata.peerId">{connectedNodeMetadata ? connectedNodeMetadata.peerId : ""}</p>
            <p data-testid="injectedAccountsConsumptionState">{injectedAccountsConsumptionState}</p>
            <p data-testid="injectedAccounts.length">{injectedAccounts !== null ? injectedAccounts.length : -1}</p>
        </div>
    );
}

function expectConnectedAndReadyState(result: RenderResult) {
    expect(result.getByTestId("connectedNodeMetadata.peerId")).toHaveTextContent("Mock peer ID");
}

test('Context automatically connects', async () => {
    const result = render(<InspectorInContext/>);
    await waitFor(() => expectConnectedAndReadyState(result));
});

test("Context automatically listens to injected accounts", async () => {
    let result = render(<InspectorInContext/>);
    await waitFor(() => expect(result.getByTestId("injectedAccountsConsumptionState")).toHaveTextContent("STARTED"));
});

test("Context detects injected accounts update", async () => {
    let result = render(<InspectorInContext/>);
    const accounts = [{}, {}, {}];
    await waitFor(() => updateInjectedAccounts(accounts));
    await waitFor(() => expect(result.getByTestId("injectedAccounts.length")).toHaveTextContent(accounts.length.toString()));
});
