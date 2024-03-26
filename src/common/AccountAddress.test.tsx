import { Numbers } from "@logion/node-api";
import { mockValidPolkadotAccountId } from 'src/__mocks__/LogionMock';
import { shallowRender } from '../tests';

import AccountAddress from './AccountAddress';

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
                    accountId: mockValidPolkadotAccountId("address1"),
                    isLegalOfficer: false,
                }}
                disabled={ false }
            />
        );
        expect(result).toMatchSnapshot();
    });
    
});
