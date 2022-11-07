jest.mock('../logion-chain');
jest.mock('../common/CommonContext');
jest.mock('./UserContext');

import ContextualizedWallet from './ContextualizedWallet';
import { apiMock, setContextMock } from '../logion-chain/__mocks__/LogionChainMock';
import { shallowRender, mockAccount } from '../tests';
import { Account } from 'src/common/types/Accounts';

describe("ContextualizedWallet", () => {

    const account = mockAccount("address", "Account name") as unknown as Account;

    test('Given disconnected and accounts then empty', () => {
        setContextMock({
            api: null,
            accounts: [
                account
            ]
        });
    
        const tree = shallowRender(<ContextualizedWallet />);
    
        expect(tree).toMatchSnapshot();
    });
    
    test('Given connected and account, then renders with router', () => {
        setContextMock({
            api: apiMock,
            accounts: [
                account
            ]
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
