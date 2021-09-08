import { shallowRender } from '../tests';

import AccountAddress from './AccountAddress';

test("renders", () => {
    const result = shallowRender(
        <AccountAddress
            hint="My hint"
            address={{
                name: "Name 1",
                address: "address1",
                isLegalOfficer: false,
            }}
            disabled={ false }
        />
    );
    expect(result).toMatchSnapshot();
});
