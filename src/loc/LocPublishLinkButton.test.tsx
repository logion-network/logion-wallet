jest.mock("./LocContext");
import { UUID } from "logion-api/dist/UUID";

import { LocItem } from "./types";
import { shallowRender } from "../tests";
import LocPublishLinkButton from "./LocPublishLinkButton";

describe("LocPublishLinkButton", () => {

    const locItem:LocItem = {
        name: "link-name",
        type: "Linked LOC",
        status: "DRAFT",
        submitter: "link-submitter",
        value: "link-value",
        target: new UUID("94cec06d-dca4-4a62-83f4-a82c5425d94e"),
        nature: "link-nature",
        timestamp: null,
        newItem: false,
    }

    it("renders", () => {
        const tree = shallowRender(<LocPublishLinkButton locItem={ locItem } />)
        expect(tree).toMatchSnapshot();
    })
})
