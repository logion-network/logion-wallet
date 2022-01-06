import { shallowRender } from '../tests';
import { getCoin } from '../logion-chain/Balances';
import { PrefixedNumber, MILLI } from '../logion-chain/numbers';

import WalletGauge from './WalletGauge';

test("renders arc", () => {
    testWalletGauge('arc');
});

function testWalletGauge(type: 'arc' | 'linear') {
    const result = shallowRender(<WalletGauge
        coin={ getCoin('lgnt') }
        balance={ new PrefixedNumber("20.00", MILLI) }
        level={ 0.5 }
        type={ type }
    />);
    expect(result).toMatchSnapshot();
}

test("renders linear", () => {
    testWalletGauge('linear');
});
