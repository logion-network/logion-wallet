import { UUID } from "@logion/node-api";
import { ItemStatus, LocData, hashString } from "@logion/client";
import { render as renderTesting, waitFor, screen } from "@testing-library/react";
import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { Compact, u128 } from "@polkadot/types-codec";
import { PalletLogionLocMetadataItemParams } from "@polkadot/types/lookup";

import { clickByName, render } from "../tests";
import { LocItems } from "./LocItems";
import { buildLocRequest } from "./TestData";
import { LocItem } from "./LocItem";
import React from "react";
import { accounts, DEFAULT_LEGAL_OFFICER_ACCOUNT, setCurrentAddress } from "src/logion-chain/__mocks__/LogionChainMock";
import { Account } from "src/common/types/Accounts";
import { DateTime } from "luxon";
import { DEFAULT_LEGAL_OFFICER } from "src/common/TestData";
import { setLocRequest, setLocState } from "./__mocks__/LocContextMock";
import { EditableRequest } from "src/__mocks__/LogionClientMock";
import { It, Mock } from "moq.ts";
import { setupApiMock, OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from "src/__mocks__/LogionMock";

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
    setupApiMock(api => {
        const submittable = new Mock<SubmittableExtrinsic<"promise">>();
        api.setup(instance => instance.polkadot.tx.logionLoc.addMetadata(It.IsAny(), It.IsAny())).returns(submittable.object());
        const locId = new Mock<Compact<u128>>();
        api.setup(instance => instance.adapters.toLocId(It.IsAny())).returns(locId.object());
        const item = new Mock<PalletLogionLocMetadataItemParams>();
        api.setup(instance => instance.adapters.toPalletLogionLocMetadataItem(It.IsAny())).returns(item.object());
    });
    renderTesting(component);
    await clickByName(deleteButtonName);
    await waitFor(() => expect(_locState.deleteMetadata).toBeCalled());
}

const deleteButtonName = (content: string) => /trash/.test(content);

function testCannotDeleteNonDraftMetadataItem(component: React.ReactElement) {
    setupApiMock(api => {
        const submittable = new Mock<SubmittableExtrinsic<"promise">>();
        api.setup(instance => instance.polkadot.tx.logionLoc.addMetadata(It.IsAny(), It.IsAny())).returns(submittable.object());
        const locId = new Mock<Compact<u128>>();
        api.setup(instance => instance.adapters.toLocId(It.IsAny())).returns(locId.object());
        const item = new Mock<PalletLogionLocMetadataItemParams>();
        api.setup(instance => instance.adapters.toPalletLogionLocMetadataItem(It.IsAny())).returns(item.object());
    });
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
    _locState.legalOfficer.deleteLink = jest.fn().mockResolvedValue(_locState);
    setLocState(_locState);
    return request;
}

let _locState: EditableRequest;

function givenMetadataItem(request: LocData, status: ItemStatus): LocItem[] {
    request.metadata.push({
        name: "Name",
        nameHash: hashString("Name"),
        addedOn: "2022-01-20T15:45:00.000",
        submitter: accounts!.current!.accountId,
        value: "Value",
        published: status === "PUBLISHED",
        status,
    });
    return [{
        name: "Name",
        newItem: false,
        status: status,
        submitter: accounts!.current!.accountId,
        timestamp: null,
        type: "Data",
        value: "Value",
        template: false,
    }];
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
        addedOn: "2022-01-20T15:45:00.000",
        submitter: accounts!.current!.accountId,
        nature: "Some nature",
        hash: "0xfb45e95061306e90fd154272ba3b4d67bb6d295feeccdc3a34572995f08e268a",
        published: status === "PUBLISHED",
        restrictedDelivery: false,
        contentType: "text/plain",
        size: 42n,
        status,
    });
    return [{
        name: "Name",
        newItem: false,
        status: status,
        submitter: accounts!.current!.accountId,
        timestamp: null,
        type: "Document",
        value: "0xfb45e95061306e90fd154272ba3b4d67bb6d295feeccdc3a34572995f08e268a",
        template: false,
    }];
}

async function testDeletesDraftLinkItem(component: React.ReactElement) {
    setupApiMock(api => {
        const submittable = new Mock<SubmittableExtrinsic<"promise">>();
        api.setup(instance => instance.polkadot.tx.logionLoc.addLink(It.IsAny(), It.IsAny())).returns(submittable.object());
        const locId = new Mock<Compact<u128>>();
        api.setup(instance => instance.adapters.toLocId(It.IsAny())).returns(locId.object());
    });
    renderTesting(component);
    await clickByName(deleteButtonName);
    await waitFor(() => expect(_locState.legalOfficer.deleteLink).toBeCalled());
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
        addedOn: "2022-01-20T15:45:00.000",
        nature: "Some nature",
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
            template: false,
        }
    ];
}
