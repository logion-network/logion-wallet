import { mockValidPolkadotAccountId } from 'src/__mocks__/LogionMock';
import { shallowRender } from '../tests';

import AccountAddress from './AccountAddress';

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
