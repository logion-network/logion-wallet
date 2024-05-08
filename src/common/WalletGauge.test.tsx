jest.mock("../logion-chain");

import { shallowRender } from '../tests';
import { TypesAccountData, Lgnt } from '@logion/node-api';

import WalletGauge from './WalletGauge';

describe("WalletGauge", () => {

    it("renders", () => {
        const balance: TypesAccountData = {
            available: Lgnt.from(0.02),
            reserved: Lgnt.zero(),
            total: Lgnt.from(0.02),
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
