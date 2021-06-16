jest.mock('./logion-chain');
jest.mock('./RootContext');

import { setContextMock } from './logion-chain';
import { shallowRender, mockAccount, act } from './tests';

import RootRouter from './RootRouter';
import { DEFAULT_LEGAL_OFFICER } from './legal-officer/Types';

test('Given null injected accounts, when rendering, then null', () => {
    setContextMock({
        injectedAccounts: null,
    });
    let tree: any;
    act(() => { tree = shallowRender(<RootRouter />) });
    expect(tree).toMatchSnapshot();
});

test('Given no injected accounts, when rendering, then null', () => {
    setContextMock({
        injectedAccounts: [],
    });
    let tree: any;
    act(() => { tree = shallowRender(<RootRouter />) });
    expect(tree).toMatchSnapshot();
});

test('Given legal officer, when rendering, then route to wallet or redirect', () => {
    setContextMock({
        injectedAccounts: [
            mockAccount(DEFAULT_LEGAL_OFFICER, "Account name")
        ]
    });

    let tree: any;
    act(() => { tree = shallowRender(<RootRouter />) });

    expect(tree).toMatchSnapshot();
});

test('Given wallet user, when rendering, then route to wallet or redirect', () => {
    setContextMock({
        injectedAccounts: [
            mockAccount("userAddress", "Account name")
        ]
    });

    let tree: any;
    act(() => { tree = shallowRender(<RootRouter />) });

    expect(tree).toMatchSnapshot();
});
