jest.mock('react-router');
jest.mock("./RootContext");

import { shallowRender } from '../tests';

import Transactions from './Transactions';
import { setBalances, setTransactions } from './__mocks__/RootContextMock';
import { setParams } from '../__mocks__/ReactRouterMock';
import { DEFAULT_COIN_BALANCE, DEFAULT_TRANSACTION, COLOR_THEME } from './TestData';

test('renders null with missing data', () => {
    const result = shallowRender(<Transactions
        backPath={ "back" }
        colorTheme={ COLOR_THEME }
    />);
    expect(result).toMatchSnapshot();
});

test('renders with all data', () => {
    setParams({coinId: 'log'});
    setBalances([ DEFAULT_COIN_BALANCE ]);
    setTransactions([ DEFAULT_TRANSACTION ]);
    const result = shallowRender(<Transactions
        backPath={ "back" }
        colorTheme={ COLOR_THEME }
    />);
    expect(result).toMatchSnapshot();
});
