import { setLocsState } from "./__mocks__/UserContextMock";

jest.mock('../logion-chain');
jest.mock('../common/CommonContext');
jest.mock('./UserContext');

import UserDashboard from './UserDashboard';
import { setContextMock } from '../logion-chain/__mocks__/LogionChainMock';
import { shallowRender } from '../tests';
import { LocsState } from "@logion/client";
import { api } from 'src/__mocks__/LogionMock';
import { TEST_WALLET_USER } from "./TestData";

describe("UserDashboard", () => {

    setLocsState({} as LocsState)

    const accountId = TEST_WALLET_USER;

    test('Given disconnected and accounts then empty', () => {
        setContextMock({
            api: null,
            accounts: {
                current: {
                    accountId
                }
            }
        });

        const tree = shallowRender(<UserDashboard />);

        expect(tree).toMatchSnapshot();
    });

    test('Given connected and account, then renders with router', () => {
        setContextMock({
            api: api.object(),
            accounts: {
                current: {
                    accountId
                }
            }
        });

        const tree = shallowRender(<UserDashboard />);

        expect(tree).toMatchSnapshot();
    });

    test('Given connected and no account then renders without router', () => {
        setContextMock({
            api: api.object(),
            accounts: null
        });

        const tree = shallowRender(<UserDashboard />);

        expect(tree).toMatchSnapshot();
    });
});
