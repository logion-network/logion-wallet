jest.mock("./CommonContext");

import { shallowRender } from '../tests';

import Wallet, { Content } from './Wallet';
import { setBalances, setTransactions } from './__mocks__/CommonContextMock';
import { DEFAULT_COIN_BALANCE, DEFAULT_TRANSACTION, COLOR_THEME } from './TestData';

test('renders content', () => {
    const result = shallowRender(<Wallet
        transactionsPath={ coindId => coindId }
        colorTheme={ COLOR_THEME }
    />);
    expect(result).toMatchSnapshot();
});

test('renders loader with no data', () => {
    const result = shallowRender(<Content
        transactionsPath={ coindId => coindId }
        colorTheme={ COLOR_THEME }
    />);
    expect(result).toMatchSnapshot();
});

test('renders with all data', () => {
    setBalances([ DEFAULT_COIN_BALANCE ]);
    setTransactions([ DEFAULT_TRANSACTION ]);
    const result = shallowRender(<Content
        transactionsPath={ coindId => coindId }
        colorTheme={ COLOR_THEME }
    />);
    expect(result).toMatchSnapshot();
});
