jest.mock('./common/CommonContext');
jest.mock('./directory/DirectoryContext');

import { shallowRender } from './tests';

import RootRouter from './RootRouter';
import { setAddresses, setCurrentAddress, DEFAULT_LEGAL_OFFICER_ACCOUNT, DEFAULT_USER_ACCOUNT } from './common/__mocks__/CommonContextMock';

test('Given null addresses, when rendering, then null', () => {
    setAddresses(null);
    const tree = shallowRender(<RootRouter />);
    expect(tree).toMatchSnapshot();
});

test('Given no addresses, when rendering, then null', () => {
    setAddresses({
        all: [],
    });
    const tree = shallowRender(<RootRouter />);
    expect(tree).toMatchSnapshot();
});

test('Given undefined current address, when rendering, then enable redirect to login via either legal officer or user route', () => {
    setCurrentAddress(undefined);
    const tree = shallowRender(<RootRouter />);
    expect(tree).toMatchSnapshot();
});

test('Given legal officer, when rendering, then render legal officer UI or redirect to login', () => {
    setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
    const tree = shallowRender(<RootRouter />);
    expect(tree).toMatchSnapshot();
});

test('Given wallet user, when rendering, then render user UI or redirect to login', () => {
    setCurrentAddress(DEFAULT_USER_ACCOUNT);
    const tree = shallowRender(<RootRouter />);
    expect(tree).toMatchSnapshot();
});
