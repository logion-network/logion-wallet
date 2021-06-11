jest.mock('../logion-chain');
jest.mock('./UserContext');

import React from 'react';
import Wallet from './Wallet';
import { setContextMock } from '../logion-chain';
import { shallowRender, mockAccount } from '../tests';

test('Given disconnected, when rendering, then show disconnected and connect button', () => {
    setContextMock({
        apiState: 'DISCONNECTED',
        injectedAccounts: [
            mockAccount("address", "name")
        ]
    });

    const tree = shallowRender(<Wallet />);

    expect(tree).toMatchSnapshot();
});

test('Given connected, when rendering, then show account, no connect button and tokenization', () => {
    setContextMock({
        apiState: 'READY',
        injectedAccounts: [
            mockAccount("address", "Account name")
        ],
        connectedNodeMetadata: {
            name: "Node name",
            peerId: "Node peer ID"
        }
    });

    const tree = shallowRender(<Wallet />);

    expect(tree).toMatchSnapshot();
});

test('Given connected and no metadata, when rendering, then show account, no connect button, no node info, tokenization', () => {
    setContextMock({
        apiState: 'READY',
        injectedAccounts: [
            mockAccount("address", "Account name")
        ],
        connectedNodeMetadata: null
    });

    const tree = shallowRender(<Wallet />);

    expect(tree).toMatchSnapshot();
});

test('Given connection error, when rendering, then show account, no button, no node info', () => {
    setContextMock({
        apiState: 'ERROR',
        injectedAccounts: [
            mockAccount("address", "Account name")
        ],
        connectedNodeMetadata: null
    });

    const tree = shallowRender(<Wallet />);

    expect(tree).toMatchSnapshot();
});

test('Given connecting, when rendering, then show account, no button, no node info', () => {
    setContextMock({
        apiState: 'CONNECTING',
        injectedAccounts: [
            mockAccount("address", "Account name")
        ],
        connectedNodeMetadata: null
    });

    const tree = shallowRender(<Wallet />);

    expect(tree).toMatchSnapshot();
});

test('Given no injected account, when rendering, then nothing displayed', () => {
    setContextMock({
        apiState: 'READY',
        injectedAccounts: null,
        connectedNodeMetadata: null
    });

    const tree = shallowRender(<Wallet />);

    expect(tree).toMatchSnapshot();
});
