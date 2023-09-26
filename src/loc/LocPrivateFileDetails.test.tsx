import { shallowRender } from "../tests";
import { TEST_WALLET_USER } from "../wallet-user/TestData";
import LocPrivateFileDetails from "./LocPrivateFileDetails";
import { CommonData, FileItem } from "./LocItem";
import { Hash } from "@logion/node-api";
import { ItemStatus } from "@logion/client";
import { render, waitFor, screen } from "@testing-library/react";

describe("LocPrivateFileDetails", () => {

    function commonData(status: ItemStatus = "DRAFT", rejectReason?: string): CommonData {
        return {
            timestamp: null,
            type: "Document",
            submitter: TEST_WALLET_USER,
            status,
            rejectReason,
            newItem: false,
            template: false,
        }
    };

    const regularFileData = {
        fileName: "a file",
        hash: Hash.fromHex("0xfb45e95061306e90fd154272ba3b4d67bb6d295feeccdc3a34572995f08e268a"),
        nature: "File's nature",
        size: 4n,
        storageFeePaidBy: "Requester",
    };

    const regularFileItem = new FileItem(commonData(), regularFileData);

    const zeroSizeFileData = {
        fileName: "a file",
        hash: Hash.fromHex("0xfb45e95061306e90fd154272ba3b4d67bb6d295feeccdc3a34572995f08e268a"),
        nature: "File's nature",
        size: 0n,
        storageFeePaidBy: "Requester",
    };

    const zeroSizeFileItem = new FileItem(commonData(), zeroSizeFileData);

    function createItem(status: ItemStatus, rejectReason?: string): FileItem {
        return new FileItem(commonData(status, rejectReason), regularFileData);
    }

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

    it("shows correct title when not published", async () => {
        const item = createItem("REVIEW_ACCEPTED");
        render(shallowRender(<LocPrivateFileDetails
            item={ item }
            documentClaimHistory=""
            otherFeesPaidByRequester={ true }
        />));
        await waitFor(() => expect(screen.getByText("Document related data to be published")).toBeVisible());
    });

    it("shows correct title when published", async () => {
        const item = createItem("ACKNOWLEDGED");
        render(shallowRender(<LocPrivateFileDetails
            item={ item }
            documentClaimHistory=""
            otherFeesPaidByRequester={ true }
        />));
        await waitFor(() => expect(screen.getByText("Published document related data")).toBeVisible());
    });

    it("shows reason when rejected", async () => {
        const rejectReason = "Some reject reason";
        const item = createItem("REVIEW_REJECTED", rejectReason);
        render(shallowRender(<LocPrivateFileDetails
            item={ item }
            documentClaimHistory=""
            otherFeesPaidByRequester={ true }
        />));
        await waitFor(() => expect(screen.getByText(rejectReason)).toBeVisible());
    });

});
