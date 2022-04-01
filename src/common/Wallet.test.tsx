jest.mock("./CommonContext");
jest.unmock("logion-api/dist/Balances");

import { shallowRender } from '../tests';

import Wallet, { Content } from './Wallet';
import { DEFAULT_COIN_BALANCE, DEFAULT_TRANSACTION } from './TestData';

test('renders content', () => {
    const result = shallowRender(<Wallet
        transactionsPath={ coinId => coinId }
        settingsPath=''
        balances={ [] }
        transactions={ [] }
    />);
    expect(result).toMatchSnapshot();
});

test('renders loader with no data', () => {
    const result = shallowRender(<Content
        transactionsPath={ coinId => coinId }
        settingsPath=''
        balances={ null }
        transactions={ null }
        type="Wallet"
    />);
    expect(result).toMatchSnapshot();
});

test('renders with all data', () => {
    const result = shallowRender(<Content
        transactionsPath={ coinId => coinId }
        settingsPath=''
        balances={ [ DEFAULT_COIN_BALANCE ] }
        transactions={ [ DEFAULT_TRANSACTION ] }
        type="Wallet"
    />);
    expect(result).toMatchSnapshot();
});
