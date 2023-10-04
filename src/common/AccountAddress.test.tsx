import { Numbers } from "@logion/node-api";
import { mockValidPolkadotAccountId } from 'src/__mocks__/LogionMock';
import { shallowRender } from '../tests';

import AccountAddress from './AccountAddress';

test("renders", () => {
    const result = shallowRender(
        <AccountAddress
            balance={{
                available: new Numbers.PrefixedNumber("2", Numbers.NONE),
                balance: new Numbers.PrefixedNumber("2", Numbers.NONE),
                coin: {
                    iconId: "lgnt",
                    iconType: "svg",
                    id: "lgnt",
                    name: "LGNT",
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
