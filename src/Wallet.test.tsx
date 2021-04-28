jest.mock('./logion-chain');

import React from 'react';
import Wallet from './Wallet';
import { setContextMock } from './logion-chain';
import { shallowRender, mockAccount } from './tests';

test('Given one injected account, when rendering, then show account', () => {
    setContextMock({
        apiState: 'READY',
        injectedAccounts: [
            mockAccount("address", "name")
        ]
    });

    const tree = shallowRender(<Wallet />);

    expect(tree).toMatchSnapshot();
});
