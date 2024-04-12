jest.mock('react-router');
jest.mock("./CommonContext");

import { shallowRender } from '../tests';

import Transactions from './Transactions';
import { setBalanceState } from './__mocks__/CommonContextMock';
import { setParams } from '../__mocks__/ReactRouterMock';
import { DEFAULT_COIN_BALANCE, DEFAULT_TRANSACTION, DEFAULT_FAILED_TRANSACTION } from './TestData';
import { BalanceState } from '@logion/client/dist/Balance.js';
import { TEST_WALLET_USER } from 'src/wallet-user/TestData';

test('renders null with missing data', () => {
    const result = shallowRender(<Transactions
        account={ TEST_WALLET_USER }
        balances={ [] }
        transactions={ [] }
        type="Wallet"
    />);
    expect(result).toMatchSnapshot();
});

test('renders with all data', () => {
    setParams({coinId: 'lgnt'});
    setBalanceState({
        balances: [ DEFAULT_COIN_BALANCE ],
        transactions: [ DEFAULT_TRANSACTION ],
    } as BalanceState);
    const result = shallowRender(<Transactions
        account={ TEST_WALLET_USER }
        balances={ [] }
        transactions={ [] }
        type="Wallet"
    />);
    expect(result).toMatchSnapshot();
});

test('renders failed transaction', () => {
    setParams({coinId: 'lgnt'});
    setBalanceState({
        balances: [ DEFAULT_COIN_BALANCE ],
        transactions: [ DEFAULT_FAILED_TRANSACTION ],
    } as BalanceState);
    const result = shallowRender(<Transactions
        account={ TEST_WALLET_USER }
        balances={ [] }
        transactions={ [] }
        type="Wallet"
    />);
    expect(result).toMatchSnapshot();
});
