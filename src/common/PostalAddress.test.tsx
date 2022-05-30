import { PostalAddress as PostalAddressType } from '@logion/client';

import { render } from '../tests';
import PostalAddress from './PostalAddress';
import { DEFAULT_ADDRESS, COLOR_THEME } from './TestData';

const DIFFERENT_ADDRESS: PostalAddressType = {
    line1: "Place de le République Française, 258741257",
    line2: "",
    postalCode: "4000",
    city: "Liège",
    country: "Belgium",
};

test("renders without comparison", () => {
    const tree = render(
        <PostalAddress
            postalAddress={ DEFAULT_ADDRESS }
            colors={ COLOR_THEME.dashboard }
            squeeze={ true }
        />
    );
    expect(tree).toMatchSnapshot();
});

test("renders and compares with same address", () => {
    const tree = render(
        <PostalAddress
            postalAddress={ DEFAULT_ADDRESS }
            otherPostalAddress={ DEFAULT_ADDRESS }
            colors={ COLOR_THEME.dashboard }
            squeeze={ true }
        />
    );
    expect(tree).toMatchSnapshot();
});

test("renders and compares with different address", () => {
    const tree = render(
        <PostalAddress
            postalAddress={ DEFAULT_ADDRESS }
            otherPostalAddress={ DIFFERENT_ADDRESS }
            colors={ COLOR_THEME.dashboard }
            squeeze={ true }
        />
    );
    expect(tree).toMatchSnapshot();
});
