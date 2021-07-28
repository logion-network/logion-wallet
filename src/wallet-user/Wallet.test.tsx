jest.mock("../RootContext");
jest.mock("./UserContext");

import { shallowRender } from '../tests';

import Wallet from './Wallet';
import { setBalances, setTransactions } from './__mocks__/UserContextMock';
import { DEFAULT_COIN_BALANCE, DEFAULT_TRANSACTION } from './TestData';

test('renders null with missing data', () => {
    const result = shallowRender(<Wallet/>);
    expect(result).toMatchSnapshot();
});

test('renders with all data', () => {
    setBalances([ DEFAULT_COIN_BALANCE ]);
    setTransactions([ DEFAULT_TRANSACTION ]);
    const result = shallowRender(<Wallet/>);
    expect(result).toMatchSnapshot();
});
