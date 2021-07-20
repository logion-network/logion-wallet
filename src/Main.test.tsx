jest.mock('./logion-chain');
jest.mock('./logion-chain/Keys');
jest.mock('./config');

import React from 'react';
import Main from './Main';
import { setContextMock } from './logion-chain/__mocks__/LogionChainMock';
import { setExtensionAvailable } from './logion-chain/__mocks__/KeysMock';
import { shallowRender, mockAccount, act } from './tests';

test('Given no enabled extension, when rendering, then show loader', () => {
    setContextMock({
        extensionsEnabled: false,
    });

    let tree: any;
    act(() => { tree = shallowRender(<Main />) });

    expect(tree).toMatchSnapshot();
});

test('Given no extension, when rendering, then show install', () => {
    setExtensionAvailable(false);
    setContextMock({
        extensionsEnabled: true,
    });

    let tree: any;
    act(() => { tree = shallowRender(<Main />) });

    expect(tree).toMatchSnapshot();
});

test('Given extension and loading accounts, when rendering, then show loader', () => {
    setExtensionAvailable(true);
    setContextMock({
        extensionsEnabled: true,
        injectedAccounts: null,
    });

    let tree: any;
    act(() => { tree = shallowRender(<Main />) });

    expect(tree).toMatchSnapshot();
});

test('Given extension and no account, when rendering, then show create account', () => {
    setContextMock({
        extensionsEnabled: true,
        injectedAccounts: [],
    });
    setExtensionAvailable(true);

    let tree: any;
    act(() => { tree = shallowRender(<Main />) });

    expect(tree).toMatchSnapshot();
});

test('Given extension and one account, when rendering, then show root router', () => {
    setContextMock({
        apiState: 'READY',
        injectedAccounts: [
            mockAccount("address", "Account name")
        ],
        extensionsEnabled: true,
    });
    setExtensionAvailable(true);

    let tree: any;
    act(() => { tree = shallowRender(<Main />) });

    expect(tree).toMatchSnapshot();
});
