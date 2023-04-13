import { shallowRender } from '../tests';

import AccountAddress from './AccountAddress';
import { mockValidPolkadotAccountId } from "../__mocks__/@logion/node-api/Mocks";

test("renders", () => {
    const result = shallowRender(
        <AccountAddress
            hint="My hint"
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
