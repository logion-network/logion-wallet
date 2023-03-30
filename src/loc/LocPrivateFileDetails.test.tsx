import { shallowRender } from "../tests";
import { TEST_WALLET_USER } from "../wallet-user/TestData";
import LocPrivateFileDetails from "./LocPrivateFileDetails";
import { LocItem } from "./LocItem";

describe("LocPrivateFileDetails", () => {

    const item: LocItem = {
        name: "a file",
        value: "0xfb45e95061306e90fd154272ba3b4d67bb6d295feeccdc3a34572995f08e268a",
        timestamp: null,
        type: "Document",
        submitter: TEST_WALLET_USER,
        status: "DRAFT",
        nature: "File's nature",
        newItem: false,
        template: false,
    };

    it("renders", () => {
        const element = shallowRender(<LocPrivateFileDetails
            item={ { ...item, size: 42n } }
            documentClaimHistory=""
            storageFeePaidByRequester={ true }
        />);
        expect(element).toMatchSnapshot();
    });

    it("renders 0-sized file", () => {
        const element = shallowRender(<LocPrivateFileDetails
            item={ { ...item, size: 0n } }
            documentClaimHistory=""
            storageFeePaidByRequester={ true }
        />);
        expect(element).toMatchSnapshot();
    });
});
