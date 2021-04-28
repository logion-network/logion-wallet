jest.mock('./logion-chain');
jest.mock('./config');

import React from 'react';
import Main from './Main';
import { setContextMock, setExtensionAvailable } from './logion-chain';
import { shallowRender, mockAccount } from './tests';

test('Given connecting, when rendering, then show status', () => {
    setContextMock({
        apiState: 'CONNECT_INIT'
    });

    const tree = shallowRender(<Main />);

    expect(tree).toMatchSnapshot();
});

test('Given connected and no extension, when rendering, then show install', () => {
    setContextMock({
        apiState: 'READY'
    });
    setExtensionAvailable(false);

    const tree = shallowRender(<Main />);

    expect(tree).toMatchSnapshot();
});

test('Given connected and extension and no account, when rendering, then show create account', () => {
    setContextMock({
        apiState: 'READY',
        injectedAccounts: []
    });
    setExtensionAvailable(true);

    const tree = shallowRender(<Main />);

    expect(tree).toMatchSnapshot();
});

test('Given connected and extension and one account, when rendering, then show wallet', () => {
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
