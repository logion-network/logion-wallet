jest.mock('./logion-chain');
jest.mock('./config');

import React from 'react';
import Main from './Main';
import { setContextMock, setExtensionAvailable } from './logion-chain';
import { shallowRender, mockAccount } from './tests';

test('Given no extension, when rendering, then show install', () => {
    setExtensionAvailable(false);

    const tree = shallowRender(<Main />);

    expect(tree).toMatchSnapshot();
});

test('Given extension and loading accounts, when rendering, then show loader', () => {
    setExtensionAvailable(true);

    const tree = shallowRender(<Main />);

    expect(tree).toMatchSnapshot();
});

test('Given extension and no account, when rendering, then show create account', () => {
    setContextMock({
        injectedAccounts: []
    });
    setExtensionAvailable(true);

    const tree = shallowRender(<Main />);

    expect(tree).toMatchSnapshot();
});

test('Given extension and one account, when rendering, then show wallet', () => {
    setContextMock({
        apiState: 'READY',
        injectedAccounts: [
            mockAccount("address", "Account name")
        ]
    });
    setExtensionAvailable(true);

    const tree = shallowRender(<Main />);

    expect(tree).toMatchSnapshot();
});
