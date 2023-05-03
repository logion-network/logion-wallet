jest.mock("../logion-chain");

import { shallowRender } from '../tests';
import { Queries, Numbers } from '@logion/node-api';

import WalletGauge from './WalletGauge';

test("renders arc", () => {
    testWalletGauge('arc');
});

function testWalletGauge(type: 'arc' | 'linear') {
    const result = shallowRender(<WalletGauge
        coin={ Queries.getCoin('lgnt') }
        balance={ new Numbers.PrefixedNumber("20.00", Numbers.MILLI) }
        level={ 0.5 }
        type={ type }
    />);
    expect(result).toMatchSnapshot();
}

test("renders linear", () => {
    testWalletGauge('linear');
});
