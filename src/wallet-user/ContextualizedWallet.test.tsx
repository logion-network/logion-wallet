import { setLocsState } from "./__mocks__/UserContextMock";

jest.mock('../logion-chain');
jest.mock('../common/CommonContext');
jest.mock('./UserContext');

import ContextualizedWallet from './ContextualizedWallet';
import { apiMock, setContextMock } from '../logion-chain/__mocks__/LogionChainMock';
import { shallowRender, mockAccount } from '../tests';
import { LocsState } from "@logion/client";
import { mockValidPolkadotAccountId } from "src/__mocks__/@logion/node-api/Mocks";

describe("ContextualizedWallet", () => {

    setLocsState({} as LocsState)

    const accountId = mockValidPolkadotAccountId("address");

    test('Given disconnected and accounts then empty', () => {
        setContextMock({
            api: null,
            accounts: {
                current: {
                    accountId
                }
            }
        });
    
        const tree = shallowRender(<ContextualizedWallet />);
    
        expect(tree).toMatchSnapshot();
    });
    
    test('Given connected and account, then renders with router', () => {
        setContextMock({
            api: apiMock,
            accounts: {
                current: {
                    accountId
                }
            }
        });

        const tree = shallowRender(<ContextualizedWallet />);
    
        expect(tree).toMatchSnapshot();
    });

    test('Given connected and no account then renders without router', () => {
        setContextMock({
            api: apiMock,
            accounts: null
        });
    
        const tree = shallowRender(<ContextualizedWallet />);
    
        expect(tree).toMatchSnapshot();
    }); 
});
