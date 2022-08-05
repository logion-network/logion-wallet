import { UUID } from "@logion/node-api/dist/UUID";
import { render as renderTesting, waitFor, screen } from "@testing-library/react";
import { OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from "../__mocks__/@logion/node-api/dist/LogionLocMock";
import { clickByName, render } from "../tests";
import { LOLocItems, UserLocItems } from "./LocItems";
import { buildLocRequest } from "./TestData";
import { setLoc, setLocId, setLocItems, setLocRequest, deleteMetadata, deleteFile, deleteLink } from "./__mocks__/LocContextMock";
import { setLoc as setUserLoc, setLocId as setUserLocId, setLocItems as setUserLocItems, deleteMetadata as deleteUserMetadata, deleteFile as deleteUserFile } from "./__mocks__/UserLocContextMock";
import { LocRequest } from "../common/types/ModelTypes";
import { LocItem, LocItemStatus } from "./types";
import React from "react";
import { DEFAULT_LEGAL_OFFICER } from "src/common/TestData";
import { accounts, DEFAULT_LEGAL_OFFICER_ACCOUNT, setCurrentAddress } from "src/logion-chain/__mocks__/LogionChainMock";
import { Account } from "src/common/types/Accounts";
import { DateTime } from "luxon";

jest.mock("../common/CommonContext");
jest.mock("./LocContext");
jest.mock("./UserLocContext");
jest.mock("../logion-chain");

describe("LOLocItems", () => {

    beforeEach(() => {
        jest.resetAllMocks();
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
    });

    it("renders empty list", () => {
        testRendersEmptyList(<LOLocItems />);
    });

    it("renders with single draft item", () => {
        testRendersSingleDraftItem(<LOLocItems />);
    });

    it("deletes draft metadata item", async () => {
        await testDeletesDraftMetadataItem(<LOLocItems />, deleteMetadata);
    });

    it("cannot delete non-draft metadata item", async () => {
        await testCannotDeleteNonDraftMetadataItem(<LOLocItems />);
    });

    it("deletes draft file item", async () => {
        await testDeletesDraftFileItem(<LOLocItems />, deleteFile);
    });

    it("cannot delete non-draft file item", async () => {
        await testCannotDeleteNonDraftFileItem(<LOLocItems />);
    });

    it("deletes draft link item", async () => {
        await testDeletesDraftLinkItem(<LOLocItems />);
    });

    it("cannot delete non-draft link item", async () => {
        await testCannotDeleteNonDraftLinkItem(<LOLocItems />);
    });
});

describe("UserLocItems", () => {

    beforeEach(() => {
        jest.resetAllMocks();
        setCurrentAddress(REQUESTER_ACCOUNT);
    });

    it("renders empty list", () => {
        testRendersEmptyList(<UserLocItems />);
    });

    it("renders with single draft item", () => {
        testRendersSingleDraftItem(<UserLocItems />);
    });

    it("deletes draft metadata item", async () => {
        await testDeletesDraftMetadataItem(<UserLocItems />, deleteUserMetadata);
    });

    it("cannot delete non-draft metadata item", async () => {
        await testCannotDeleteNonDraftMetadataItem(<UserLocItems />);
    });

    it("deletes draft file item", async () => {
        await testDeletesDraftFileItem(<UserLocItems />, deleteUserFile);
    });

    it("cannot delete non-draft file item", async () => {
        await testCannotDeleteNonDraftFileItem(<UserLocItems />);
    });
});

const REQUESTER_ACCOUNT: Account = {
    name: "name",
    address: OPEN_IDENTITY_LOC.requesterAddress!,
    isLegalOfficer: false,
    token: {
        value: "token",
        expirationDateTime: DateTime.now(),
    },
}

function testRendersEmptyList(component: React.ReactElement) {
    givenOpenLoc();
    const tree = render(component);
    expect(tree).toMatchSnapshot();
}

function testRendersSingleDraftItem(component: React.ReactElement) {
    const request = givenOpenLoc();
    givenMetadataItem(request, "DRAFT");
    const tree = render(component);
    expect(tree).toMatchSnapshot();
}

async function testDeletesDraftMetadataItem(component: React.ReactElement, deleteMetadata: jest.Mock) {
    const request = givenOpenLoc();
    givenMetadataItem(request, "DRAFT");
    renderTesting(component);
    await clickByName(deleteButtonName);
    await waitFor(() => expect(deleteMetadata).toBeCalled());
}

const deleteButtonName = (content: string) => /trash/.test(content);

async function testCannotDeleteNonDraftMetadataItem(component: React.ReactElement) {
    const request = givenOpenLoc();
    givenMetadataItem(request, "PUBLISHED");
    renderTesting(component);
    expect(screen.queryByRole("button", { name: deleteButtonName })).not.toBeInTheDocument();
}

function givenOpenLoc() {
    const uuid = UUID.fromDecimalString(OPEN_IDENTITY_LOC_ID)!;
    const request = buildLocRequest(uuid, OPEN_IDENTITY_LOC);
    if(accounts!.current!.isLegalOfficer) {
        setLocId(uuid);
        setLoc(OPEN_IDENTITY_LOC);
        setLocRequest(request);
    } else {
        setUserLocId(uuid);
        setUserLoc({
            ...OPEN_IDENTITY_LOC,
            id: uuid,
            createdOn: DateTime.now().toISO(),
            description: "",
            ownerAddress: DEFAULT_LEGAL_OFFICER,
            status: "OPEN",
            files: [],
            metadata: [],
            links: [],
        });
    }
    return request;
}

function givenMetadataItem(request: LocRequest, status: LocItemStatus) {
    request.metadata.push({
        name: "Name",
        addedOn: "2022-01-20T15:45:00.000",
        submitter: accounts!.current!.address,
        value: "Value"
    });
    setItems([{
        name: "Name",
        newItem: false,
        status: status,
        submitter: accounts!.current!.address,
        timestamp: null,
        type: "Data",
        value: "Value"
    }])
}

function setItems(items: LocItem[]) {
    if(accounts!.current!.isLegalOfficer) {
        setLocItems(items);
    } else {
        setUserLocItems(items);
    }
}

async function testDeletesDraftFileItem(component: React.ReactElement, deleteFile: jest.Mock) {
    const request = givenOpenLoc();
    givenFileItem(request, "DRAFT");
    renderTesting(component);
    await clickByName(deleteButtonName);
    await waitFor(() => expect(deleteFile).toBeCalled());
}

async function testCannotDeleteNonDraftFileItem(component: React.ReactElement) {
    const request = givenOpenLoc();
    givenFileItem(request, "PUBLISHED");
    renderTesting(component);
    expect(screen.queryByRole("button", { name: deleteButtonName })).not.toBeInTheDocument();
}

function givenFileItem(request: LocRequest, status: LocItemStatus) {
    request.files.push({
        name: "Name",
        addedOn: "2022-01-20T15:45:00.000",
        submitter: accounts!.current!.address,
        nature: "Some nature",
        hash: "0xfb45e95061306e90fd154272ba3b4d67bb6d295feeccdc3a34572995f08e268a",
    });
    setItems([{
        name: "Name",
        newItem: false,
        status: status,
        submitter: accounts!.current!.address,
        timestamp: null,
        type: "Document",
        value: "0xfb45e95061306e90fd154272ba3b4d67bb6d295feeccdc3a34572995f08e268a",
    }]);
}

async function testDeletesDraftLinkItem(component: React.ReactElement) {
    const request = givenOpenLoc();
    givenLinkItem(request, "DRAFT");
    renderTesting(component);
    await clickByName(deleteButtonName);
    await waitFor(() => expect(deleteLink).toBeCalled());
}

async function testCannotDeleteNonDraftLinkItem(component: React.ReactElement) {
    const request = givenOpenLoc();
    givenLinkItem(request, "PUBLISHED");
    renderTesting(component);
    expect(screen.queryByRole("button", { name: deleteButtonName })).not.toBeInTheDocument();
}

function givenLinkItem(request: LocRequest, status: LocItemStatus) {
    const targetId = new UUID();
    request.links.push({
        addedOn: "2022-01-20T15:45:00.000",
        nature: "Some nature",
        id: targetId,
        target: targetId.toString(),
    });
    setLocItems([
        {
            name: "Name",
            newItem: false,
            status: status,
            submitter: DEFAULT_LEGAL_OFFICER,
            timestamp: null,
            type: "Linked LOC",
            value: targetId.toDecimalString(),
        }
    ])
}
