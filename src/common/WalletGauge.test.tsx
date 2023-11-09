jest.mock("../logion-chain");

import { shallowRender } from '../tests';
import { CoinBalance, Queries, Numbers } from '@logion/node-api';

import WalletGauge from './WalletGauge';

test("renders arc", () => {
    testWalletGauge('arc');
});

function testWalletGauge(type: 'arc' | 'linear') {
    const balance: CoinBalance = {
        coin: Queries.getCoin('lgnt'),
        available: new Numbers.PrefixedNumber("20.00", Numbers.MILLI),
        reserved: new Numbers.PrefixedNumber("0", Numbers.NONE),
        total: new Numbers.PrefixedNumber("20.00", Numbers.MILLI),
        level: 0.5,
    };
    const result = shallowRender(<WalletGauge
        balance={ balance }
        type={ type }
    />);
    expect(result).toMatchSnapshot();
}

test("renders linear", () => {
    testWalletGauge('linear');
});
