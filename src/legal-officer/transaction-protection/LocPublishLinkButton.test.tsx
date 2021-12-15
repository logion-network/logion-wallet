jest.mock("./LocContext");

import { LocItem } from "./types";
import { shallowRender } from "../../tests";
import LocPublishLinkButton from "./LocPublishLinkButton";
import { UUID } from "../../logion-chain/UUID";

describe("LocPublishLinkButton", () => {

    const locItem:LocItem = {
        name: "link-name",
        type: "Linked LOC",
        status: "DRAFT",
        submitter: "link-submitter",
        value: "link-value",
        target: new UUID(),
        nature: "link-nature",
        timestamp: null
    }

    it("renders", () => {
        const tree = shallowRender(<LocPublishLinkButton locItem={ locItem } />)
        expect(tree).toMatchSnapshot();
    })
})
