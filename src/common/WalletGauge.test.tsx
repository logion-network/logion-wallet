jest.mock("../logion-chain");

import { shallowRender } from '../tests';
import { CoinBalance, Queries, Numbers } from '@logion/node-api';

import WalletGauge from './WalletGauge';

describe("WalletGauge", () => {

    it("renders", () => {
        const balance: CoinBalance = {
            coin: Queries.getCoin('lgnt'),
            available: new Numbers.PrefixedNumber("20.00", Numbers.MILLI),
            reserved: new Numbers.PrefixedNumber("0", Numbers.NONE),
            total: new Numbers.PrefixedNumber("20.00", Numbers.MILLI),
            level: 0.5,
        };
        const result = shallowRender(<WalletGauge
            balance={ balance }
            sendButton={ true }
            sendToVault={ false }
            withdrawFromVault={ false }
        />);
        expect(result).toMatchSnapshot();
    });    
});
