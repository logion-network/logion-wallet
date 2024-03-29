import { render, waitFor, screen } from "@testing-library/react";
import { EditableRequest } from "src/__mocks__/LogionClientMock";
import { DEFAULT_LEGAL_OFFICER_ACCOUNT, setCurrentAddress } from "../logion-chain/__mocks__/LogionChainMock";
import { clickByName, typeByLabel } from "../tests";
import { TEST_WALLET_USER } from "../wallet-user/TestData";
import { LocPublicDataButton } from "./LocPublicDataButton";
import { MetadataItem, MetadataData } from "./LocItem";
import { setLocItems, setLocState } from "./__mocks__/LocContextMock";
import { HashString } from "@logion/client";

jest.mock("./LocContext");
jest.mock("./UserLocContext");

const value = HashString.fromValue("Value");
const existingItem = new MetadataItem(
    {
        status: "DRAFT",
        newItem: false,
        submitter: TEST_WALLET_USER,
        type: "Data",
        timestamp: null,
        template: false,
    },
    {
        name: HashString.fromValue("Name"),
        value,
    }
);

describe("LocPublicDataButton", () => {

    beforeEach(() => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
    });

    it("adds metadata", async () => {
        const { addMetadata } = mockEditableRequest();
        await testAddsMetadata(<LocPublicDataButton text="Add a public data"/>, addMetadata);
    });

    it("does nothing on cancel", async () => {
        const { addMetadata } = mockEditableRequest();
        await testDoesNothingOnCancel(<LocPublicDataButton text="Add a public data"/>, addMetadata);
    });

    it("does not add metadata if already exists", async () => {
        const { addMetadata } = mockEditableRequest();
        setLocItems([ existingItem ]);
        await testDoesNotNothingIfItemExists(<LocPublicDataButton text="Add a public data"/>, addMetadata);
    });
});

function mockEditableRequest(): { locState: EditableRequest, addMetadata: jest.Mock } {
    const addMetadata = jest.fn();
    const locState = new EditableRequest();
    locState.addMetadata = addMetadata;
    setLocState(locState);
    return { addMetadata, locState };
}

async function testAddsMetadata(component: React.ReactElement, addMetadata: jest.Mock) {
    render(component);

    await clickAdd();
    const modal = screen.getByRole("dialog");
    await typeByLabel("Public data name (No confidential or personal information)", existingItem.data().name.validValue());
    await typeByLabel("Public data (No confidential or personal information)", existingItem.data().value.validValue());
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
    await typeByLabel("Public data name (No confidential or personal information)", existingItem.data().name.validValue());
    await typeByLabel("Public data (No confidential or personal information)", existingItem.data().value.validValue());
    await clickByName("Cancel");
    expect(addMetadata).not.toBeCalled();
    await waitFor(() => expect(modal).not.toBeInTheDocument());
}

async function testDoesNotNothingIfItemExists(component: React.ReactElement, addMetadata: jest.Mock) {
    render(component);

    await clickAdd();
    const modal = screen.getByRole("dialog");
    await typeByLabel("Public data name (No confidential or personal information)", existingItem.as<MetadataData>().name.validValue());
    await typeByLabel("Public data (No confidential or personal information)", existingItem.as<MetadataData>().value.validValue());
    await clickByName("Submit");
    await waitFor(() => expect(addMetadata).not.toBeCalled());
    await waitFor(() => expect(modal).not.toBeInTheDocument());
    const errorModal = screen.getByRole("dialog");
    await waitFor(() => expect(screen.getByText(/already exists/i)).toBeInTheDocument());
    await clickByName("OK");
    await waitFor(() => expect(errorModal).not.toBeInTheDocument());
}
