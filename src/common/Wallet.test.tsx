jest.mock("../RootContext");

import { shallowRender } from '../tests';

import Wallet from './Wallet';
import { setBalances, setTransactions } from '../__mocks__/RootContextMock';
import { DEFAULT_COIN_BALANCE, DEFAULT_TRANSACTION, COLOR_THEME } from './TestData';

test('renders null with missing data', () => {
    const result = shallowRender(<Wallet
        transactionsPath={ coindId => coindId }
        colorTheme={ COLOR_THEME }
    />);
    expect(result).toMatchSnapshot();
});

test('renders with all data', () => {
    setBalances([ DEFAULT_COIN_BALANCE ]);
    setTransactions([ DEFAULT_TRANSACTION ]);
    const result = shallowRender(<Wallet
        transactionsPath={ coindId => coindId }
        colorTheme={ COLOR_THEME }
    />);
    expect(result).toMatchSnapshot();
});
