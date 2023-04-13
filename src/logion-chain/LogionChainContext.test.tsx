jest.mock('@polkadot/api');
jest.mock('@logion/extension');
jest.mock('@logion/client');

import { useLogionChain, LogionChainContextProvider } from './LogionChainContext';
import { render, waitFor, RenderResult } from '@testing-library/react';

import {
    teardown as teardownApi,
} from '../__mocks__/PolkadotApiMock';
import { updateInjectedAccounts, teardown as teardownExtensionDapp } from '../__mocks__/PolkadotExtensionDappMock';
import { DEFAULT_USER_ACCOUNT } from './__mocks__/LogionChainMock';

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

const INJECTED_ACCOUNT = {
    address: DEFAULT_USER_ACCOUNT.accountId,
    meta: {
        name: DEFAULT_USER_ACCOUNT.name
    }
}

test('Context automatically connects once accounts are injected', async () => {
    const result = render(<InspectorInContext/>);
    await waitFor(() => updateInjectedAccounts([ INJECTED_ACCOUNT ]));
    await waitFor(() => expectConnectedAndReadyState(result));
});

test("Context automatically listens to injected accounts", async () => {
    let result = render(<InspectorInContext/>);
    await waitFor(() => expect(result.getByTestId("injectedAccountsConsumptionState")).toHaveTextContent("STARTED"));
});

test("Context detects injected accounts update", async () => {
    let result = render(<InspectorInContext/>);
    await waitFor(() => updateInjectedAccounts([ INJECTED_ACCOUNT ]));
    await waitFor(() => expect(result.getByTestId("injectedAccounts.length")).toHaveTextContent("1"));
});
