jest.mock('./logion-chain');

import React from 'react';
import Wallet from './Wallet';
import { setContextMock } from './logion-chain';
import { shallowRender, mockAccount } from './tests';

test('Given disconnected, when rendering, then show disconnected and button', () => {
    setContextMock({
        apiState: 'DISCONNECTED',
        injectedAccounts: [
            mockAccount("address", "name")
        ]
    });

    const tree = shallowRender(<Wallet />);

    expect(tree).toMatchSnapshot();
});

test('Given connected, when rendering, then show account and no button', () => {
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
