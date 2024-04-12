import { Numbers } from "@logion/node-api";
import { shallowRender } from '../tests';

import AccountAddress from './AccountAddress';
import { TEST_WALLET_USER } from "src/wallet-user/TestData";

describe("AccountAddress", () => {

    it("renders", () => {
        const result = shallowRender(
            <AccountAddress
                balance={{
                    available: new Numbers.PrefixedNumber("2", Numbers.NONE),
                    total: new Numbers.PrefixedNumber("2", Numbers.NONE),
                    reserved: new Numbers.PrefixedNumber("0", Numbers.NONE),
                    coin: {
                        id: "lgnt",
                        symbol: "LGNT"
                    },
                    level: 1
                }}
                account={{
                    name: "Name 1",
                    accountId: TEST_WALLET_USER,
                    isLegalOfficer: false,
                }}
                disabled={ false }
            />
        );
        expect(result).toMatchSnapshot();
    });
    
});
