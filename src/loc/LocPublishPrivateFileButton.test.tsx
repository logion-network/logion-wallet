jest.mock("./LocContext");
jest.mock("src/logion-chain");

import { UUID, Hash } from "@logion/node-api";
import { FileItem } from "./LocItem";
import { shallowRender } from "../tests";
import LocPublishPrivateFileButton from "./LocPublishPrivateFileButton";
import { mockValidPolkadotAccountId } from 'src/__mocks__/LogionMock';

describe("LocPublishPrivateFileButton", () => {

    const locId = new UUID("62e3ea0e-eee5-4295-819e-ed01b55472f0");
    const locItem = new FileItem(
        {
            type: "Document",
            status: "DRAFT",
            submitter: mockValidPolkadotAccountId("file-submitter"),
            timestamp: null,
            newItem: false,
            template: false,
        },
        {
            fileName: "file-name",
            hash: Hash.of("file-value"),
            nature: "file-nature",
            size: 10n,
            storageFeePaidBy: "Requester"
        }
    );

    it("renders", () => {
        const tree = shallowRender(<LocPublishPrivateFileButton locItem={ locItem } locId={ locId } />)
        expect(tree).toMatchSnapshot();
    })
})
