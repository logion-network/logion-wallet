import { UUID, Hash } from "@logion/node-api";
import { ItemStatus, LocData, HashString } from "@logion/client";
import { render as renderTesting, waitFor, screen } from "@testing-library/react";

import { clickByName, render } from "../tests";
import { LocItems } from "./LocItems";
import { buildLocRequest } from "./TestData";
import { FileItem, LinkItem, LocItem, MetadataItem } from "./LocItem";
import React from "react";
import { accounts, DEFAULT_LEGAL_OFFICER_ACCOUNT, setCurrentAddress } from "src/logion-chain/__mocks__/LogionChainMock";
import { Account } from "src/common/types/Accounts";
import { DateTime } from "luxon";
import { DEFAULT_LEGAL_OFFICER } from "src/common/TestData";
import { setLocRequest, setLocState } from "./__mocks__/LocContextMock";
import { EditableRequest } from "src/__mocks__/LogionClientMock";
import { OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from "src/__mocks__/LogionMock";

jest.mock("../common/CommonContext");
jest.mock("../logion-chain");
jest.mock("./LocContext");

describe("LOLocItems", () => {

    beforeEach(() => {
        jest.resetAllMocks();
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
    });

    it("renders empty list", () => {
        givenOpenLoc();
        testRendersEmptyList(<LocItems
            viewer="LegalOfficer"
            locItems={[]}
            isEmpty={true}
        />);
    });

    it("renders with single draft item", () => {
        const loc = givenOpenLoc();
        const items = givenMetadataItem(loc, "DRAFT");
        testRendersSingleDraftItem(<LocItems
            viewer="LegalOfficer"
            locItems={items}
            isEmpty={false}
        />);
    });

    it("cannot delete non-draft metadata item", () => {
        const loc = givenOpenLoc();
        const items = givenMetadataItem(loc, "PUBLISHED");
        testCannotDeleteNonDraftMetadataItem(<LocItems
            viewer="LegalOfficer"
            locItems={items}
            isEmpty={false}
        />);
    });

    it("cannot delete non-draft file item", () => {
        const loc = givenOpenLoc();
        const items = givenFileItem(loc, "PUBLISHED");
        testCannotDeleteNonDraftFileItem(<LocItems
            viewer="LegalOfficer"
            locItems={items}
            isEmpty={false}
        />);
    });

    it("deletes draft link item", async () => {
        const loc = givenOpenLoc();
        const items = givenLinkItem(loc, "DRAFT");
        await testDeletesDraftLinkItem(<LocItems
            viewer="LegalOfficer"
            locItems={items}
            isEmpty={false}
        />);
    });

    it("cannot delete non-draft link item", () => {
        const loc = givenOpenLoc();
        const items = givenLinkItem(loc, "PUBLISHED");
        testCannotDeleteNonDraftLinkItem(<LocItems
            viewer="LegalOfficer"
            locItems={items}
            isEmpty={false}
        />);
    });
});

describe("UserLocItems", () => {

    beforeEach(() => {
        jest.resetAllMocks();
        setCurrentAddress(REQUESTER_ACCOUNT);
    });

    it("renders empty list", () => {
        givenOpenLoc();
        testRendersEmptyList(<LocItems
            viewer="User"
            locItems={[]}
            isEmpty={true}
        />);
    });

    it("renders with single draft item", () => {
        const loc = givenOpenLoc();
        const items = givenMetadataItem(loc, "DRAFT");
        testRendersSingleDraftItem(<LocItems
            viewer="User"
            locItems={items}
            isEmpty={false}
        />);
    });

    it("deletes draft metadata item", async () => {
        const loc = givenOpenLoc();
        const items = givenMetadataItem(loc, "DRAFT");
        await testDeletesDraftMetadataItem(<LocItems
            viewer="User"
            locItems={items}
            isEmpty={false}
        />);
    });

    it("cannot delete non-draft metadata item", () => {
        const loc = givenOpenLoc();
        const items = givenMetadataItem(loc, "PUBLISHED");
        testCannotDeleteNonDraftMetadataItem(<LocItems
            viewer="User"
            locItems={items}
            isEmpty={false}
        />);
    });

    it("deletes draft file item", async () => {
        const loc = givenOpenLoc();
        const items = givenFileItem(loc, "DRAFT");
        await testDeletesDraftFileItem(<LocItems
            viewer="User"
            locItems={items}
            isEmpty={false}
        />);
    });

    it("cannot delete non-draft file item", () => {
        const loc = givenOpenLoc();
        const items = givenFileItem(loc, "PUBLISHED");
        testCannotDeleteNonDraftFileItem(<LocItems
            viewer="User"
            locItems={items}
            isEmpty={false}
        />);
    });
});

const REQUESTER_ACCOUNT: Account = {
    name: "name",
    accountId: OPEN_IDENTITY_LOC.requesterAddress!,
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

async function testDeletesDraftMetadataItem(component: React.ReactElement) {
    renderTesting(component);
    await clickByName(deleteButtonName);
    await waitFor(() => expect(_locState.deleteMetadata).toBeCalled());
}

const deleteButtonName = (content: string) => /trash/.test(content);

function testCannotDeleteNonDraftMetadataItem(component: React.ReactElement) {
    renderTesting(component);
    expect(screen.queryByRole("button", { name: deleteButtonName })).not.toBeInTheDocument();
}

function givenOpenLoc() {
    const uuid = UUID.fromDecimalString(OPEN_IDENTITY_LOC_ID)!;
    const request = buildLocRequest(uuid, OPEN_IDENTITY_LOC);
    setLocRequest(request);
    _locState = new EditableRequest();
    _locState.deleteFile = jest.fn().mockResolvedValue(_locState);
    _locState.deleteMetadata = jest.fn().mockResolvedValue(_locState);
    _locState.deleteLink = jest.fn().mockResolvedValue(_locState);
    setLocState(_locState);
    return request;
}

let _locState: EditableRequest;

function givenMetadataItem(request: LocData, status: ItemStatus): LocItem[] {
    request.metadata.push({
        name: HashString.fromValue("Name"),
        addedOn: DateTime.fromISO("2022-01-20T15:45:00.000"),
        submitter: accounts!.current!.accountId,
        value: HashString.fromValue("Value"),
        published: status === "PUBLISHED",
        status,
        acknowledgedByOwner: status === "ACKNOWLEDGED",
        acknowledgedByVerifiedIssuer: false,
    });
    return [new MetadataItem(
        {
            newItem: false,
            status: status,
            submitter: accounts!.current!.accountId,
            timestamp: null,
            type: "Data",
            template: false,
        },
        {
            name: HashString.fromValue("Name"),
            value: HashString.fromValue("Value"),
        }
    )];
}

async function testDeletesDraftFileItem(component: React.ReactElement) {
    renderTesting(component);
    await clickByName(deleteButtonName);
    await waitFor(() => expect(_locState.deleteFile).toBeCalled());
}

function testCannotDeleteNonDraftFileItem(component: React.ReactElement) {
    renderTesting(component);
    expect(screen.queryByRole("button", { name: deleteButtonName })).not.toBeInTheDocument();
}

function givenFileItem(request: LocData, status: ItemStatus): LocItem[] {
    request.files.push({
        name: "Name",
        addedOn: DateTime.fromISO("2022-01-20T15:45:00.000"),
        submitter: accounts!.current!.accountId,
        nature: HashString.fromValue("Some nature"),
        hash: Hash.fromHex("0xfb45e95061306e90fd154272ba3b4d67bb6d295feeccdc3a34572995f08e268a"),
        published: status === "PUBLISHED",
        restrictedDelivery: false,
        contentType: "text/plain",
        size: 42n,
        status,
        acknowledgedByOwner: status === "ACKNOWLEDGED",
        acknowledgedByVerifiedIssuer: false,
        storageFeePaidBy: "Requester",
    });
    return [new FileItem(
        {
            newItem: false,
            status: status,
            submitter: accounts!.current!.accountId,
            timestamp: null,
            type: "Document",
            template: false,
        },
        {
            fileName: "Name",
            hash: Hash.fromHex("0xfb45e95061306e90fd154272ba3b4d67bb6d295feeccdc3a34572995f08e268a"),
            nature: "Some nature",
            size: 42n,
            storageFeePaidBy: "Requester",
        }
    )];
}

async function testDeletesDraftLinkItem(component: React.ReactElement) {
    renderTesting(component);
    await clickByName(deleteButtonName);
    await waitFor(() => expect(_locState.deleteLink).toBeCalled());
}

function testCannotDeleteNonDraftLinkItem(component: React.ReactElement) {
    const request = givenOpenLoc();
    givenLinkItem(request, "PUBLISHED");
    renderTesting(component);
    expect(screen.queryByRole("button", { name: deleteButtonName })).not.toBeInTheDocument();
}

function givenLinkItem(request: LocData, status: ItemStatus): LocItem[] {
    const targetId = new UUID();
    request.links.push({
        addedOn: DateTime.fromISO("2022-01-20T15:45:00.000"),
        submitter: accounts!.current!.accountId,
        nature: HashString.fromValue("Some nature"),
        target: targetId,
        published: status === "PUBLISHED",
        status,
        acknowledgedByOwner: status === "ACKNOWLEDGED",
        acknowledgedByVerifiedIssuer: false,
    });
    return [new LinkItem(
        {
            newItem: false,
            status: status,
            submitter: DEFAULT_LEGAL_OFFICER,
            timestamp: null,
            type: "Linked LOC",
            template: false,
        },
        {
            nature: "Some nature",
            linkDetailsPath: "",
            linkedLoc: {
                id: targetId,
            } as unknown as LocData,
        }
    )];
}
