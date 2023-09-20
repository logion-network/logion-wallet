import { shallowRender } from "../tests";
import { TEST_WALLET_USER } from "../wallet-user/TestData";
import LocPrivateFileDetails from "./LocPrivateFileDetails";
import { CommonData, FileItem } from "./LocItem";
import { Hash } from "@logion/node-api";

describe("LocPrivateFileDetails", () => {

    const commonData: CommonData = {
        timestamp: null,
        type: "Document",
        submitter: TEST_WALLET_USER,
        status: "DRAFT",
        newItem: false,
        template: false,
    };

    const regularFileData = {
        fileName: "a file",
        hash: Hash.fromHex("0xfb45e95061306e90fd154272ba3b4d67bb6d295feeccdc3a34572995f08e268a"),
        nature: "File's nature",
        size: 4n,
        storageFeePaidBy: "Requester",
    };

    const regularFileItem = new FileItem(commonData, regularFileData);

    const zeroSizeFileData = {
        fileName: "a file",
        hash: Hash.fromHex("0xfb45e95061306e90fd154272ba3b4d67bb6d295feeccdc3a34572995f08e268a"),
        nature: "File's nature",
        size: 0n,
        storageFeePaidBy: "Requester",
    };

    const zeroSizeFileItem = new FileItem(commonData, zeroSizeFileData);

    it("renders", () => {
        const element = shallowRender(<LocPrivateFileDetails
            item={ regularFileItem }
            documentClaimHistory=""
            otherFeesPaidByRequester={ true }
        />);
        expect(element).toMatchSnapshot();
    });

    it("renders 0-sized file", () => {
        const element = shallowRender(<LocPrivateFileDetails
            item={ zeroSizeFileItem }
            documentClaimHistory=""
            otherFeesPaidByRequester={ true }
        />);
        expect(element).toMatchSnapshot();
    });
});
