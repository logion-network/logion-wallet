jest.mock('react-router');
jest.mock("./CommonContext");

import { shallowRender } from '../tests';

import Transactions from './Transactions';
import { DEFAULT_COIN_BALANCE, DEFAULT_FAILED_TRANSACTION, ZERO_BALANCE } from './TestData';
import { TEST_WALLET_USER } from 'src/wallet-user/TestData';

test('renders null with missing data', () => {
    const result = shallowRender(<Transactions
        account={ TEST_WALLET_USER }
        balance={ null }
        transactions={ [] }
        type="Wallet"
    />);
    expect(result).toMatchSnapshot();
});

test('renders with all data', () => {
    const result = shallowRender(<Transactions
        account={ TEST_WALLET_USER }
        balance={ DEFAULT_COIN_BALANCE }
        transactions={ [] }
        type="Wallet"
    />);
    expect(result).toMatchSnapshot();
});

test('renders failed transaction', () => {
    const result = shallowRender(<Transactions
        account={ TEST_WALLET_USER }
        balance={ DEFAULT_COIN_BALANCE }
        transactions={ [ DEFAULT_FAILED_TRANSACTION ] }
        type="Wallet"
    />);
    expect(result).toMatchSnapshot();
});
