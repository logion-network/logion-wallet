import { setLocsState } from "./__mocks__/UserContextMock";

jest.mock('../logion-chain');
jest.mock('../common/CommonContext');
jest.mock('./UserContext');

import ContextualizedWallet from './ContextualizedWallet';
import { setContextMock } from '../logion-chain/__mocks__/LogionChainMock';
import { shallowRender } from '../tests';
import { LocsState } from "@logion/client";
import { mockValidPolkadotAccountId, api } from 'src/__mocks__/LogionMock';

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
            api: api.object(),
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
            api: api.object(),
            accounts: null
        });
    
        const tree = shallowRender(<ContextualizedWallet />);
    
        expect(tree).toMatchSnapshot();
    }); 
});
