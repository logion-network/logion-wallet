import { shallowRender } from "../tests";
import { TEST_WALLET_USER } from "../wallet-user/TestData";
import LocPrivateFileDetails from "./LocPrivateFileDetails";
import { LocItem } from "./types";

describe("LocPrivateFileDetails", () => {

    it("renders", () => {
        const item: LocItem = {
            name: "a file",
            value: "0xfb45e95061306e90fd154272ba3b4d67bb6d295feeccdc3a34572995f08e268a",
            timestamp: null,
            type: "Document",
            submitter: TEST_WALLET_USER,
            status: "DRAFT",
            nature: "File's nature",
            newItem: false,
        };
        const element = shallowRender(<LocPrivateFileDetails item={ item } viewer="LegalOfficer"/>);
        expect(element).toMatchSnapshot();
    });
});
