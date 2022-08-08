import { render, waitFor, screen } from "@testing-library/react";
import { sha256Hex } from "src/common/__mocks__/HashMock";
import { accounts, DEFAULT_LEGAL_OFFICER_ACCOUNT, DEFAULT_USER_ACCOUNT, setCurrentAddress } from "src/logion-chain/__mocks__/LogionChainMock";
import { clickByName, typeByLabel, uploadByTestId } from "src/tests";
import { TEST_WALLET_USER } from "src/wallet-user/TestData";
import { LOLocPrivateFileButton, UserLocPrivateFileButton } from "./LocPrivateFileButton";
import { LocItem } from "./types";
import { setLocItems, addFile } from "./__mocks__/LocContextMock";
import { setLocItems as setUserLocItems, addFile as addUserFile } from "./__mocks__/UserLocContextMock";

jest.mock("../common/hash");
jest.mock("./LocContext");
jest.mock("./UserLocContext");

const file = new File(['test'], "id.jpg");
const fileHash = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
const existingFileItem: LocItem = {
    name: "John Doe's ID",
    nature: "ID",
    status: "DRAFT",
    newItem: false,
    submitter: TEST_WALLET_USER,
    type: "Document",
    value: "0x" + fileHash,
    timestamp: null,
};

describe("LOLocPrivateFileButton", () => {

    beforeEach(() => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
    });

    it("uploads file", async () => {
        await testUploadsFile(<LOLocPrivateFileButton />, addFile);
    });

    it("does nothing on cancel", async () => {
        await testDoesNothingOnCancel(<LOLocPrivateFileButton />, addFile);
    });

    it("does not upload file if already exists", async () => {
        await testDoesNotNothingIfFileExists(<LOLocPrivateFileButton />, addFile);
    });
});

describe("UserLocPrivateFileButton", () => {

    beforeEach(() => {
        setCurrentAddress(DEFAULT_USER_ACCOUNT);
    });

    it("uploads file", async () => {
        await testUploadsFile(<UserLocPrivateFileButton />, addUserFile);
    });

    it("does nothing on cancel", async () => {
        await testDoesNothingOnCancel(<UserLocPrivateFileButton />, addUserFile);
    });

    it("does not upload file if already exists", async () => {
        await testDoesNotNothingIfFileExists(<UserLocPrivateFileButton />, addUserFile);
    });
});

function setItems(items: LocItem[]) {
    if(accounts!.current!.isLegalOfficer) {
        setLocItems(items);
    } else {
        setUserLocItems(items);
    }
}

async function testUploadsFile(component: React.ReactElement, addFile: jest.Mock) {
    setItems([]);
    sha256Hex.mockReturnValue(fileHash);

    render(component);

    await clickByName(content => /add a confidential document/i.test(content));
    const modal = screen.getByRole("dialog");
    await typeByLabel("Document Name", existingFileItem.name);
    await typeByLabel("Document Public Description", existingFileItem.nature || "");
    await uploadByTestId("FileSelectorButtonHiddenInput", file);
    await clickByName("Submit");
    await waitFor(() => expect(addFile).toBeCalled());
    await waitFor(() => expect(modal).not.toBeInTheDocument());
}

async function testDoesNothingOnCancel(component: React.ReactElement, addFile: jest.Mock) {
    setItems([]);
    sha256Hex.mockReturnValue(fileHash);

    render(component);

    await clickByName(content => /add a confidential document/i.test(content));
    const modal = screen.getByRole("dialog");
    await typeByLabel("Document Name", existingFileItem.name);
    await typeByLabel("Document Public Description", existingFileItem.nature || "");
    await uploadByTestId("FileSelectorButtonHiddenInput", file);
    await clickByName("Cancel");
    expect(addFile).not.toBeCalled();
    await waitFor(() => expect(modal).not.toBeInTheDocument());
}

async function testDoesNotNothingIfFileExists(component: React.ReactElement, addFile: jest.Mock) {
    setItems([ existingFileItem ]);
    sha256Hex.mockReturnValue(fileHash);

    render(component);

    await clickByName(content => /add a confidential document/i.test(content));
    const modal = screen.getByRole("dialog");
    await typeByLabel("Document Name", existingFileItem.name);
    await typeByLabel("Document Public Description", existingFileItem.nature || "");
    await uploadByTestId("FileSelectorButtonHiddenInput", file);
    await clickByName("Submit");
    await waitFor(() => expect(addFile).not.toBeCalled());
    await waitFor(() => expect(modal).not.toBeInTheDocument());
    const errorModal = screen.getByRole("dialog");
    await waitFor(() => expect(screen.getByText(/already exists/i)).toBeInTheDocument());
    await clickByName("OK");
    await waitFor(() => expect(errorModal).not.toBeInTheDocument());
}
