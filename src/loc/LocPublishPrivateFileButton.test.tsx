
jest.mock("./LocContext");

import { LocItem } from "./LocItem";
import { shallowRender } from "../tests";
import LocPublishPrivateFileButton from "./LocPublishPrivateFileButton";

describe("LocPublishPrivateFileButton", () => {

    const locItem:LocItem = {
        name: "file-name",
        type: "Document",
        status: "DRAFT",
        submitter: "file-submitter",
        value: "file-value",
        nature: "file-nature",
        timestamp: null,
        newItem: false,
        template: false,
    }

    it("renders", () => {
        const tree = shallowRender(<LocPublishPrivateFileButton locItem={ locItem } />)
        expect(tree).toMatchSnapshot();
    })
})
