jest.mock("./LocContext");
jest.mock("src/logion-chain");

import { UUID } from "@logion/node-api";
import { LocItem } from "./LocItem";
import { shallowRender } from "../tests";
import LocPublishPrivateFileButton from "./LocPublishPrivateFileButton";
import { mockValidPolkadotAccountId } from "src/__mocks__/@logion/node-api/Mocks";

describe("LocPublishPrivateFileButton", () => {

    const locId = new UUID("62e3ea0e-eee5-4295-819e-ed01b55472f0");
    const locItem:LocItem = {
        name: "file-name",
        type: "Document",
        status: "DRAFT",
        submitter: mockValidPolkadotAccountId("file-submitter"),
        value: "file-value",
        nature: "file-nature",
        timestamp: null,
        newItem: false,
        template: false,
    }

    it("renders", () => {
        const tree = shallowRender(<LocPublishPrivateFileButton locItem={ locItem } locId={ locId } />)
        expect(tree).toMatchSnapshot();
    })
})
