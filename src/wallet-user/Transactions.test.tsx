jest.mock('react-router');
jest.mock("../RootContext");
jest.mock("./UserContext");

import { shallowRender } from '../tests';

import Transactions from './Transactions';
import { setBalances, setTransactions } from './__mocks__/UserContextMock';
import { setParams } from '../__mocks__/ReactRouterMock';
import { DEFAULT_COIN_BALANCE, DEFAULT_TRANSACTION } from './TestData';

test('renders null with missing data', () => {
    const result = shallowRender(<Transactions/>);
    expect(result).toMatchSnapshot();
});

test('renders with all data', () => {
    setParams({coinId: 'log'});
    setBalances([ DEFAULT_COIN_BALANCE ]);
    setTransactions([ DEFAULT_TRANSACTION ]);
    const result = shallowRender(<Transactions/>);
    expect(result).toMatchSnapshot();
});
