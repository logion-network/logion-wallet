import { shallowRender } from '../tests';

import Dashboard, { ContentPane, FullWidthPane } from './Dashboard';
import { LIGHT_MODE } from '../legal-officer/Types';
import Addresses from './types/Addresses';

const ADDRESSES: Addresses = {
    currentAddress: {
        name: "Name 1",
        address: "address1",
        isLegalOfficer: false,
    },
    addresses: [
        {
            name: "Name 1",
            address: "address1",
            isLegalOfficer: false,
        },
        {
            name: "Name 2",
            address: "address2",
            isLegalOfficer: false,
        }
    ]
}

test("renders Dashboard", () => {
    const result = shallowRender(
        <Dashboard
            colors={ LIGHT_MODE }
            addresses={ ADDRESSES }
            selectAddress={ jest.fn() }
            menuTop={ [] }
            menuBottom={ [] }
            shieldItem={{
                text: "Protection",
                to: "/",
                exact: true,
            }}
        >
        </Dashboard>
    );
    expect(result).toMatchSnapshot();
});

test("renders ContentPane", () => {
    const result = shallowRender(
        <ContentPane
            primaryAreaChildren={ null }
            secondaryAreaChildren={ null }
        />
    );
    expect(result).toMatchSnapshot();
});

test("renders FullWidthPane", () => {
    const result = shallowRender(
        <FullWidthPane>
        </FullWidthPane>
    );
    expect(result).toMatchSnapshot();
});
