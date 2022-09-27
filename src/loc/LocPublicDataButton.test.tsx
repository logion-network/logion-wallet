import { render, waitFor, screen } from "@testing-library/react";
import { DEFAULT_LEGAL_OFFICER_ACCOUNT, setCurrentAddress } from "../logion-chain/__mocks__/LogionChainMock";
import { clickByName, typeByLabel } from "../tests";
import { TEST_WALLET_USER } from "../wallet-user/TestData";
import { LocPublicDataButton } from "./LocPublicDataButton";
import { LocItem } from "./types";

jest.mock("./LocContext");
jest.mock("./UserLocContext");

const value = "Value";
const existingItem: LocItem = {
    name: "Name",
    status: "DRAFT",
    newItem: false,
    submitter: TEST_WALLET_USER,
    type: "Data",
    value,
    timestamp: null,
};

describe("LocPublicDataButton", () => {

    beforeEach(() => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
    });

    it("adds metadata", async () => {
        const addMetadata = jest.fn();
        await testAddsMetadata(<LocPublicDataButton
            addMetadata={ addMetadata }
            locItems={ [] }
        />, addMetadata);
    });

    it("does nothing on cancel", async () => {
        const addMetadata = jest.fn();
        await testDoesNothingOnCancel(<LocPublicDataButton
            addMetadata={ addMetadata }
            locItems={ [] }
        />, addMetadata);
    });

    it("does not add metadata if already exists", async () => {
        const addMetadata = jest.fn();
        await testDoesNotNothingIfItemExists(<LocPublicDataButton
            addMetadata={ addMetadata }
            locItems={ [ existingItem ] }
        />, addMetadata);
    });
});

async function testAddsMetadata(component: React.ReactElement, addMetadata: jest.Mock) {
    render(component);

    await clickAdd();
    const modal = screen.getByRole("dialog");
    await typeByLabel("Data Name (No confidential or personal information)", existingItem.name);
    await typeByLabel("Data (No confidential or personal information)", existingItem.value);
    await clickByName("Submit");
    await waitFor(() => expect(addMetadata).toBeCalled());
    await waitFor(() => expect(modal).not.toBeInTheDocument());
}

async function clickAdd() {
    return clickByName(content => /add a public data/i.test(content));
}

async function testDoesNothingOnCancel(component: React.ReactElement, addMetadata: jest.Mock) {
    render(component);

    await clickAdd();
    const modal = screen.getByRole("dialog");
    await typeByLabel("Data Name (No confidential or personal information)", existingItem.name);
    await typeByLabel("Data (No confidential or personal information)", existingItem.value);
    await clickByName("Cancel");
    expect(addMetadata).not.toBeCalled();
    await waitFor(() => expect(modal).not.toBeInTheDocument());
}

async function testDoesNotNothingIfItemExists(component: React.ReactElement, addMetadata: jest.Mock) {
    render(component);

    await clickAdd();
    const modal = screen.getByRole("dialog");
    await typeByLabel("Data Name (No confidential or personal information)", existingItem.name);
    await typeByLabel("Data (No confidential or personal information)", existingItem.value);
    await clickByName("Submit");
    await waitFor(() => expect(addMetadata).not.toBeCalled());
    await waitFor(() => expect(modal).not.toBeInTheDocument());
    const errorModal = screen.getByRole("dialog");
    await waitFor(() => expect(screen.getByText(/already exists/i)).toBeInTheDocument());
    await clickByName("OK");
    await waitFor(() => expect(errorModal).not.toBeInTheDocument());
}
