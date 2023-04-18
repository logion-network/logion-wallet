import { render, waitFor, screen } from "@testing-library/react";
import { DEFAULT_LEGAL_OFFICER_ACCOUNT, setCurrentAddress } from "src/logion-chain/__mocks__/LogionChainMock";
import { clickByName, typeByLabel, uploadByTestId } from "src/tests";
import { TEST_WALLET_USER } from "src/wallet-user/TestData";
import { EditableRequest, setExpectedFileHash } from "src/__mocks__/LogionClientMock";
import { LocPrivateFileButton } from "./LocPrivateFileButton";
import { LocItem } from "./LocItem";
import { setLocItems, setLocState } from "./__mocks__/LocContextMock";

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
    template: false,
};

describe("LocPrivateFileButton", () => {

    beforeEach(() => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
    });

    it("uploads file", async () => {
        const { addFile } = mockEditableRequest();
        await testUploadsFile(<LocPrivateFileButton text="Add a confidential document"/>, addFile);
    });

    it("does nothing on cancel", async () => {
        const { addFile } = mockEditableRequest();
        await testDoesNothingOnCancel(<LocPrivateFileButton text="Add a confidential document"/>, addFile);
    });

    it("does not upload file if already exists", async () => {
        const { addFile } = mockEditableRequest();
        setLocItems([ existingFileItem ]);
        setExpectedFileHash("0x" + fileHash);
        await testDoesNotNothingIfFileExists(<LocPrivateFileButton text="Add a confidential document"/>, addFile);
    });
});

function mockEditableRequest(): { locState: EditableRequest, addFile: jest.Mock } {
    const addFile = jest.fn();
    const locState = new EditableRequest();
    locState.addFile = addFile;
    setLocState(locState);
    return { addFile, locState };
}

async function testUploadsFile(component: React.ReactElement, addFile: jest.Mock) {
    render(component);

    await clickByName(content => /add a confidential document/i.test(content));
    const modal = screen.getByRole("dialog");
    await typeByLabel("Document Name", existingFileItem.name!);
    await typeByLabel("Document Public Description", existingFileItem.nature || "");
    await uploadByTestId("FileSelectorButtonHiddenInput", file);
    await clickByName("Submit");
    await waitFor(() => expect(addFile).toBeCalled());
    await waitFor(() => expect(modal).not.toBeInTheDocument());
}

async function testDoesNothingOnCancel(component: React.ReactElement, addFile: jest.Mock) {
    render(component);

    await clickByName(content => /add a confidential document/i.test(content));
    const modal = screen.getByRole("dialog");
    await typeByLabel("Document Name", existingFileItem.name!);
    await typeByLabel("Document Public Description", existingFileItem.nature || "");
    await uploadByTestId("FileSelectorButtonHiddenInput", file);
    await clickByName("Cancel");
    expect(addFile).not.toBeCalled();
    await waitFor(() => expect(modal).not.toBeInTheDocument());
}

async function testDoesNotNothingIfFileExists(component: React.ReactElement, addFile: jest.Mock) {
    render(component);

    await clickByName(content => /add a confidential document/i.test(content));
    const modal = screen.getByRole("dialog");
    await typeByLabel("Document Name", existingFileItem.name!);
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
