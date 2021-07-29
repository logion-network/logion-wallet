jest.mock('./logion-chain');
jest.mock('./common/RootContext');

import { setContextMock } from './logion-chain/__mocks__/LogionChainMock';
import { shallowRender, mockAccount, act } from './tests';

import RootRouter from './RootRouter';
import { DEFAULT_LEGAL_OFFICER } from './common/types/LegalOfficer';
import { setCurrentAddress } from './common/__mocks__/RootContextMock';

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

test('Given empty current address, when rendering, then null', () => {
    setCurrentAddress("");
    const tree = shallowRender(<RootRouter />);
    expect(tree).toMatchSnapshot();
});

test('Given LO address, when rendering, then route to wallet or redirect', () => {
    setCurrentAddress(DEFAULT_LEGAL_OFFICER);
    const tree = shallowRender(<RootRouter />);
    expect(tree).toMatchSnapshot();
});
