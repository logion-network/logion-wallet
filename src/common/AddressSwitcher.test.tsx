import { shallowRender } from '../tests';

import AccountAddress from './AccountAddress';
import { LIGHT_MODE } from '../legal-officer/Types';

test("renders", () => {
    const result = shallowRender(
        <AccountAddress
            hint="My hint"
            address={{
                name: "Name 1",
                address: "address1",
                isLegalOfficer: false,
            }}
            colors={ LIGHT_MODE.accounts }
            colorThemeType="light"
        />
    );
    expect(result).toMatchSnapshot();
});
