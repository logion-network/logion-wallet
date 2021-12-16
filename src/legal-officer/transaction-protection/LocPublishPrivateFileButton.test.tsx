
jest.mock("./LocContext");

import { LocItem } from "./types";
import { shallowRender } from "../../tests";
import LocPublishPrivateFileButton from "./LocPublishPrivateFileButton";

describe("LocPublishPrivateFileButton", () => {

    const locItem:LocItem = {
        name: "file-name",
        type: "Document",
        status: "DRAFT",
        submitter: "file-submitter",
        value: "file-value",
        nature: "file-nature",
        timestamp: null
    }

    it("renders", () => {
        const tree = shallowRender(<LocPublishPrivateFileButton locItem={ locItem } />)
        expect(tree).toMatchSnapshot();
    })
})
