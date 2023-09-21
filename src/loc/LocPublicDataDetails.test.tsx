import { Hash } from "@logion/node-api";
import { shallowRender } from "../tests";
import { TEST_WALLET_USER } from "../wallet-user/TestData";
import LocPublicDataDetails from "./LocPublicDataDetails";
import { MetadataItem } from "./LocItem";

describe("LocPublicDataDetails", () => {

    it("renders", () => {
        const item = new MetadataItem(
            {
                timestamp: null,
                type: "Data",
                submitter: TEST_WALLET_USER,
                status: "DRAFT",
                newItem: false,
                template: false,
            },
            {
                name: "Data name",
                nameHash: Hash.of("Data name"),
                value: "Data value",
            }
        );
        const element = shallowRender(<LocPublicDataDetails item={ item } />);
        expect(element).toMatchSnapshot();
    });
});
