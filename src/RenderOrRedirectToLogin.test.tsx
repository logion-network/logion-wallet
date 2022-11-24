jest.mock('react-router-dom');
jest.mock('./logion-chain');

import { shallowRender, act } from './tests';

import RenderOrRedirectToLogin from './RenderOrRedirectToLogin';
import { setClientMock } from './logion-chain/__mocks__/LogionChainMock';
import { LogionClient } from '@logion/client';

describe("RenderOrRedirectToLogin", () => {

    it('redirects to login with referrer if not logged in', () => {
        setClientMock(buildClientMock(false));
        const render = jest.fn();
        const tree = shallowRender( <RenderOrRedirectToLogin render={ render } /> );
        expect(tree).toMatchSnapshot();
    });

    it('renders if logged in', () => {
        setClientMock(buildClientMock(true));
        const render = jest.fn();
        act(() => { shallowRender( <RenderOrRedirectToLogin render={ render } /> )});
        expect(render).toBeCalled();
    });

    it('empty without client', () => {
        setClientMock(null);
        const render = jest.fn();
        const tree = shallowRender( <RenderOrRedirectToLogin render={ render } /> );
        expect(tree).toMatchSnapshot();
    });
});

function buildClientMock(authenticated: boolean): LogionClient {
    return {
        isTokenValid: () => authenticated,
    } as unknown as LogionClient;
}
