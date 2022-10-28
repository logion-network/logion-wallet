import { UUID } from "@logion/node-api/dist/UUID";
import { LocData } from "@logion/client";
import { render as renderTesting, waitFor, screen } from "@testing-library/react";

import { OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from "../__mocks__/@logion/node-api/dist/LogionLocMock";
import { clickByName, render } from "../tests";
import { LocItems } from "./LocItems";
import { buildLocRequest } from "./TestData";
import { LocItem, LocItemStatus } from "./types";
import React from "react";
import { accounts, DEFAULT_LEGAL_OFFICER_ACCOUNT, setCurrentAddress } from "src/logion-chain/__mocks__/LogionChainMock";
import { Account } from "src/common/types/Accounts";
import { DateTime } from "luxon";
import { DEFAULT_LEGAL_OFFICER } from "src/common/TestData";
import { setLocItems, setLocRequest, setLocState } from "./__mocks__/LocContextMock";
import { EditableRequest } from "src/__mocks__/LogionClientMock";

jest.mock("../common/CommonContext");
jest.mock("../logion-chain");
jest.mock("./LocContext");

describe("LOLocItems", () => {

    beforeEach(() => {
        jest.resetAllMocks();
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
    });

    const deleteLink = jest.fn();
    const deleteMetadata = jest.fn();

    it("renders empty list", () => {
        givenOpenLoc();
        setLocItems([]);
        testRendersEmptyList(<LocItems
            deleteLink={ deleteLink }
            deleteMetadata={ deleteMetadata }
            viewer="LegalOfficer"
        />);
    });

    it("renders with single draft item", () => {
        const loc = givenOpenLoc();
        const items = givenMetadataItem(loc, "DRAFT");
        setLocItems(items);
        testRendersSingleDraftItem(<LocItems
            deleteLink={ deleteLink }
            deleteMetadata={ deleteMetadata }
            viewer="LegalOfficer"
        />);
    });

    it("deletes draft metadata item", async () => {
        const loc = givenOpenLoc();
        const items = givenMetadataItem(loc, "DRAFT");
        setLocItems(items);
        await testDeletesDraftMetadataItem(<LocItems
            deleteLink={ deleteLink }
            deleteMetadata={ deleteMetadata }
            viewer="LegalOfficer"
        />, deleteMetadata);
    });

    it("cannot delete non-draft metadata item", async () => {
        const loc = givenOpenLoc();
        const items = givenMetadataItem(loc, "PUBLISHED");
        setLocItems(items);
        await testCannotDeleteNonDraftMetadataItem(<LocItems
            deleteLink={ deleteLink }
            deleteMetadata={ deleteMetadata }
            viewer="LegalOfficer"
        />);
    });

    it("deletes draft file item", async () => {
        const loc = givenOpenLoc();
        const items = givenFileItem(loc, "DRAFT");
        setLocItems(items);
        await testDeletesDraftFileItem(<LocItems
            deleteLink={ deleteLink }
            deleteMetadata={ deleteMetadata }
            viewer="LegalOfficer"
        />);
    });

    it("cannot delete non-draft file item", async () => {
        const loc = givenOpenLoc();
        const items = givenFileItem(loc, "PUBLISHED");
        setLocItems(items);
        await testCannotDeleteNonDraftFileItem(<LocItems
            deleteLink={ deleteLink }
            deleteMetadata={ deleteMetadata }
            viewer="LegalOfficer"
        />);
    });

    it("deletes draft link item", async () => {
        const loc = givenOpenLoc();
        const items = givenLinkItem(loc, "DRAFT");
        setLocItems(items);
        await testDeletesDraftLinkItem(<LocItems
            deleteLink={ deleteLink }
            deleteMetadata={ deleteMetadata }
            viewer="LegalOfficer"
        />, deleteLink);
    });

    it("cannot delete non-draft link item", async () => {
        const loc = givenOpenLoc();
        const items = givenLinkItem(loc, "PUBLISHED");
        setLocItems(items);
        await testCannotDeleteNonDraftLinkItem(<LocItems
            deleteLink={ deleteLink }
            deleteMetadata={ deleteMetadata }
            viewer="LegalOfficer"
        />);
    });
});

describe("UserLocItems", () => {

    beforeEach(() => {
        jest.resetAllMocks();
        setCurrentAddress(REQUESTER_ACCOUNT);
    });

    const deleteFile = jest.fn();
    const deleteMetadata = jest.fn();

    it("renders empty list", () => {
        givenOpenLoc();
        setLocItems([]);
        testRendersEmptyList(<LocItems
            deleteLink={ null }
            deleteMetadata={ deleteMetadata }
            viewer="User"
        />);
    });

    it("renders with single draft item", () => {
        const loc = givenOpenLoc();
        const items = givenMetadataItem(loc, "DRAFT");
        setLocItems(items);
        testRendersSingleDraftItem(<LocItems
            deleteLink={ null }
            deleteMetadata={ deleteMetadata }
            viewer="User"
        />);
    });

    it("deletes draft metadata item", async () => {
        const loc = givenOpenLoc();
        const items = givenMetadataItem(loc, "DRAFT");
        setLocItems(items);
        await testDeletesDraftMetadataItem(<LocItems
            deleteLink={ null }
            deleteMetadata={ deleteMetadata }
            viewer="User"
        />, deleteMetadata);
    });

    it("cannot delete non-draft metadata item", async () => {
        const loc = givenOpenLoc();
        const items = givenMetadataItem(loc, "PUBLISHED");
        setLocItems(items);
        await testCannotDeleteNonDraftMetadataItem(<LocItems
            deleteLink={ null }
            deleteMetadata={ deleteMetadata }
            viewer="User"
        />);
    });

    it("deletes draft file item", async () => {
        const loc = givenOpenLoc();
        const items = givenFileItem(loc, "DRAFT");
        setLocItems(items);
        await testDeletesDraftFileItem(<LocItems
            deleteLink={ null }
            deleteMetadata={ deleteMetadata }
            viewer="User"
        />);
    });

    it("cannot delete non-draft file item", async () => {
        const loc = givenOpenLoc();
        const items = givenFileItem(loc, "PUBLISHED");
        setLocItems(items);
        await testCannotDeleteNonDraftFileItem(<LocItems
            deleteLink={ null }
            deleteMetadata={ deleteMetadata }
            viewer="User"
        />);
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
    const tree = render(component);
    expect(tree).toMatchSnapshot();
}

function testRendersSingleDraftItem(component: React.ReactElement) {
    const tree = render(component);
    expect(tree).toMatchSnapshot();
}

async function testDeletesDraftMetadataItem(component: React.ReactElement, deleteMetadata: jest.Mock) {
    renderTesting(component);
    await clickByName(deleteButtonName);
    await waitFor(() => expect(deleteMetadata).toBeCalled());
}

const deleteButtonName = (content: string) => /trash/.test(content);

async function testCannotDeleteNonDraftMetadataItem(component: React.ReactElement) {
    renderTesting(component);
    expect(screen.queryByRole("button", { name: deleteButtonName })).not.toBeInTheDocument();
}

function givenOpenLoc() {
    const uuid = UUID.fromDecimalString(OPEN_IDENTITY_LOC_ID)!;
    const request = buildLocRequest(uuid, OPEN_IDENTITY_LOC);
    setLocRequest(request);
    _locState = new EditableRequest();
    _locState.deleteFile = jest.fn().mockResolvedValue(_locState);
    setLocState(_locState);
    return request;
}

let _locState: EditableRequest;

function givenMetadataItem(request: LocData, status: LocItemStatus): LocItem[] {
    request.metadata.push({
        name: "Name",
        addedOn: "2022-01-20T15:45:00.000",
        submitter: accounts!.current!.address,
        value: "Value",
        published: status === "PUBLISHED",
    });
    return [{
        name: "Name",
        newItem: false,
        status: status,
        submitter: accounts!.current!.address,
        timestamp: null,
        type: "Data",
        value: "Value"
    }];
}

async function testDeletesDraftFileItem(component: React.ReactElement) {
    renderTesting(component);
    await clickByName(deleteButtonName);
    await waitFor(() => expect(_locState.deleteFile).toBeCalled());
}

async function testCannotDeleteNonDraftFileItem(component: React.ReactElement) {
    renderTesting(component);
    expect(screen.queryByRole("button", { name: deleteButtonName })).not.toBeInTheDocument();
}

function givenFileItem(request: LocData, status: LocItemStatus): LocItem[] {
    request.files.push({
        name: "Name",
        addedOn: "2022-01-20T15:45:00.000",
        submitter: accounts!.current!.address,
        nature: "Some nature",
        hash: "0xfb45e95061306e90fd154272ba3b4d67bb6d295feeccdc3a34572995f08e268a",
        published: status === "PUBLISHED",
    });
    return [{
        name: "Name",
        newItem: false,
        status: status,
        submitter: accounts!.current!.address,
        timestamp: null,
        type: "Document",
        value: "0xfb45e95061306e90fd154272ba3b4d67bb6d295feeccdc3a34572995f08e268a",
    }];
}

async function testDeletesDraftLinkItem(component: React.ReactElement, deleteLink: jest.Mock) {
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

function givenLinkItem(request: LocData, status: LocItemStatus): LocItem[] {
    const targetId = new UUID();
    request.links.push({
        addedOn: "2022-01-20T15:45:00.000",
        nature: "Some nature",
        id: targetId,
        target: targetId.toString(),
        published: status === "PUBLISHED",
    });
    return [
        {
            name: "Name",
            newItem: false,
            status: status,
            submitter: DEFAULT_LEGAL_OFFICER,
            timestamp: null,
            type: "Linked LOC",
            value: targetId.toDecimalString(),
        }
    ];
}
