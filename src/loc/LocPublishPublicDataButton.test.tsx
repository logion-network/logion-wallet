jest.mock("./LocContext");
jest.mock("src/logion-chain");

import { UUID } from "@logion/node-api";
import { LocItem } from "./LocItem";
import { shallowRender } from "../tests";
import LocPublishPublicDataButton from "./LocPublishPublicDataButton";
import { mockValidPolkadotAccountId } from "src/__mocks__/@logion/node-api/Mocks";

describe("LocPublishPublicDataButton", () => {

    const locId = new UUID("62e3ea0e-eee5-4295-819e-ed01b55472f0");
    const locItem:LocItem = {
        name: "data-name",
        type: "Data",
        status: "DRAFT",
        submitter: mockValidPolkadotAccountId("data-submitter"),
        value: "data-value",
        nature: "data-nature",
        timestamp: null,
        newItem: false,
        template: false,
    }

    it("renders", () => {
        const tree = shallowRender(<LocPublishPublicDataButton locItem={ locItem } locId={ locId } />)
        expect(tree).toMatchSnapshot();
    })
})
