jest.mock('react-router-dom');
jest.mock('./logion-chain');

import { shallowRender, act } from './tests';

import RenderOrRedirectToLogin from './RenderOrRedirectToLogin';
import { setAddresses, setCurrentAddress, DEFAULT_USER_ACCOUNT } from './logion-chain/__mocks__/LogionChainMock';
import { Account } from './common/types/Accounts';
import { TEST_WALLET_USER } from './wallet-user/TestData';

test('Given no logged account, when rendering, then redirecting to login with referrer', () => {
    const notLoggedAccount: Account = {
        name: "name",
        address: TEST_WALLET_USER,
        isLegalOfficer: false,
    };
    setAddresses({
        all: [ notLoggedAccount ],
    });
    const render = jest.fn();
    let tree: any;
    act(() => { tree = shallowRender( <RenderOrRedirectToLogin render={ render } /> )});
    expect(tree).toMatchSnapshot();
});

test('Given logged account, when rendering, then rendering', () => {
    setCurrentAddress(DEFAULT_USER_ACCOUNT);
    const render = jest.fn();
    act(() => { shallowRender( <RenderOrRedirectToLogin render={ render } /> )});
    expect(render).toBeCalled();
});
