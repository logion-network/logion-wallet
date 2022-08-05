import { render, waitFor, screen } from "@testing-library/react";
import { accounts, DEFAULT_LEGAL_OFFICER_ACCOUNT, DEFAULT_USER_ACCOUNT, setCurrentAddress } from "../logion-chain/__mocks__/LogionChainMock";
import { clickByName, typeByLabel } from "../tests";
import { TEST_WALLET_USER } from "../wallet-user/TestData";
import { LOLocPublicDataButton, UserLocPublicDataButton } from "./LocPublicDataButton";
import { LocItem } from "./types";
import { setLocItems, addMetadata } from "./__mocks__/LocContextMock";
import { setLocItems as setUserLocItems, addMetadata as addUserMetadata } from "./__mocks__/UserLocContextMock";

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

describe("LOLocPublicDataButton", () => {

    beforeEach(() => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
    });

    it("adds metadata", async () => {
        await testAddsMetadata(<LOLocPublicDataButton />, addMetadata);
    });

    it("does nothing on cancel", async () => {
        await testDoesNothingOnCancel(<LOLocPublicDataButton />, addMetadata);
    });

    it("does not add metadata if already exists", async () => {
        await testDoesNotNothingIfItemExists(<LOLocPublicDataButton />, addMetadata);
    });
});

describe("UserLocPublicDataButton", () => {

    beforeEach(() => {
        setCurrentAddress(DEFAULT_USER_ACCOUNT);
    });

    it("adds metadata", async () => {
        await testAddsMetadata(<UserLocPublicDataButton />, addUserMetadata);
    });

    it("does nothing on cancel", async () => {
        await testDoesNothingOnCancel(<UserLocPublicDataButton />, addUserMetadata);
    });

    it("does not add metadata if already exists", async () => {
        await testDoesNotNothingIfItemExists(<UserLocPublicDataButton />, addUserMetadata);
    });
});

function setItems(items: LocItem[]) {
    if(accounts!.current!.isLegalOfficer) {
        setLocItems(items);
    } else {
        setUserLocItems(items);
    }
}

async function testAddsMetadata(component: React.ReactElement, addMetadata: jest.Mock) {
    setItems([]);

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
    setItems([]);

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
    setItems([ existingItem ]);

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
