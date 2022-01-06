import { render } from "../tests";
import { DEFAULT_IDENTITY, COLOR_THEME, DEFAULT_ADDRESS } from "./TestData";
import AccountInfo from "./AccountInfo";
import { TEST_WALLET_USER } from "../wallet-user/TestData";
import IdentityType from "./types/Identity";
import PostalAddressType from "./types/PostalAddress";

const DIFFERENT_IDENTITY: IdentityType = {
    firstName: "John2",
    lastName: "Doe2",
    email: "john.doe@logion.network",
    phoneNumber: "+1234",
};

const DIFFERENT_ADDRESS: PostalAddressType = {
    line1: "Place de le République Française, 258741257",
    line2: "",
    postalCode: "4000",
    city: "Liège",
    country: "Belgium",
};

test("renders without comparison", () => {
    const tree = render(
        <AccountInfo
            label="some label"
            address={ TEST_WALLET_USER }
            identity={ DEFAULT_IDENTITY }
            postalAddress={ DEFAULT_ADDRESS }
            colors={ COLOR_THEME.dashboard }
            squeeze={ true }
        />
    );
    expect(tree).toMatchSnapshot();
});

test("renders and compares with same data", () => {
    const tree = render(
        <AccountInfo
            label="some label"
            address={ TEST_WALLET_USER }
            identity={ DEFAULT_IDENTITY }
            otherIdentity={ DEFAULT_IDENTITY }
            postalAddress={ DEFAULT_ADDRESS }
            otherPostalAddress={ DEFAULT_ADDRESS }
            colors={ COLOR_THEME.dashboard }
            squeeze={ true }
        />
    );
    expect(tree).toMatchSnapshot();
});

test("renders and compares with different data", () => {
    const tree = render(
        <AccountInfo
            label="some label"
            address={ TEST_WALLET_USER }
            identity={ DEFAULT_IDENTITY }
            otherIdentity={ DIFFERENT_IDENTITY }
            postalAddress={ DEFAULT_ADDRESS }
            otherPostalAddress={ DIFFERENT_ADDRESS }
            colors={ COLOR_THEME.dashboard }
            squeeze={ true }
        />
    );
    expect(tree).toMatchSnapshot();
});
