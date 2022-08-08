jest.mock("./LocContext");

import { LocItem } from "./types";
import { shallowRender } from "../tests";
import LocPublishPublicDataButton from "./LocPublishPublicDataButton";

describe("LocPublishPublicDataButton", () => {

    const locItem:LocItem = {
        name: "data-name",
        type: "Data",
        status: "DRAFT",
        submitter: "data-submitter",
        value: "data-value",
        nature: "data-nature",
        timestamp: null,
        newItem: false,
    }

    it("renders", () => {
        const tree = shallowRender(<LocPublishPublicDataButton locItem={ locItem } />)
        expect(tree).toMatchSnapshot();
    })
})
