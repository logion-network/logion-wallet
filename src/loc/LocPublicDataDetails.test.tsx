import { shallowRender } from "../tests";
import { TEST_WALLET_USER } from "../wallet-user/TestData";
import LocPublicDataDetails from "./LocPublicDataDetails";
import { LocItem } from "./LocItem";

describe("LocPublicDataDetails", () => {

    it("renders", () => {
        const item: LocItem = {
            name: "Data name",
            value: "Data value",
            timestamp: null,
            type: "Data",
            submitter: TEST_WALLET_USER.address,
            status: "DRAFT",
            nature: "File's nature",
            newItem: false,
            template: false,
        };
        const element = shallowRender(<LocPublicDataDetails item={ item } />);
        expect(element).toMatchSnapshot();
    });
});
