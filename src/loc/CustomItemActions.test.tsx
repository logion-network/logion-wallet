import { HashString, ItemStatus, LocData, MergedFile, MergedLink, MergedMetadataItem } from "@logion/client";
import { UUID, Hash, ValidAccountId } from "@logion/node-api";
import { shallowRender } from "../tests";
import CustomItemActions from "./CustomItemActions";
import { ItemAndRefreshFlag, createFileItem, createLinkItem, createMetadataItem } from "./LocItemFactory";
import { TEST_WALLET_USER, TEST_WALLET_USER2 } from "../wallet-user/TestData";
import { setLocRequest } from "./__mocks__/LocContextMock";
import { setViewer } from "src/common/__mocks__/CommonContextMock";
import { ContributionMode } from "./types";
import { LinkData } from "./LocItem";
import { setCurrentAddress } from "src/logion-chain/__mocks__/LogionChainMock";
import { DEFAULT_LEGAL_OFFICER } from "src/__mocks__/LogionMock";

jest.mock("./LocContext");
jest.mock("../common/CommonContext");
jest.mock("../logion-chain");

describe("CustomItemActions", () => {

    describe("Public data", () => tests(publicDataItem));
    describe("Private files", () => tests(privateFileItem));
    describe("Links", () => tests(linkItem));
});

function tests(itemFactory: (status: ItemStatus, submitter: ValidAccountId) => ItemAndRefreshFlag) {

    it("can be submitted for review or deleted by requester when draft", () => {
        asRequester();
        givenOpenLoc();
        renderAndExpectMatchWith(itemFactory("DRAFT", REQUESTER), "Requester");
    });

    it("can be reviewed by owner when submitted", () => {
        asLegalOfficer();
        givenOpenLoc();
        renderAndExpectMatchWith(itemFactory("REVIEW_PENDING", REQUESTER), undefined);
    });

    it("can be published or deleted by requester when approved", () => {
        asRequester();
        givenOpenLoc();
        renderAndExpectMatchWith(itemFactory("REVIEW_ACCEPTED", REQUESTER), "Requester");
    });

    it("are read-only for requester when published", () => {
        asRequester();
        givenOpenLoc();
        renderAndExpectMatchWith(itemFactory("PUBLISHED", REQUESTER), "Requester");
    });

    it("can be acknowledged by owner when published", () => {
        asLegalOfficer();
        givenOpenLoc();
        renderAndExpectMatchWith(itemFactory("PUBLISHED", REQUESTER), undefined);
    });

    it("are read-only for owner when acknowledged", () => {
        asLegalOfficer();
        givenOpenLoc();
        renderAndExpectMatchWith(itemFactory("ACKNOWLEDGED", REQUESTER), undefined);
    });

    it("are read-only for issuer when acknowledged", () => {
        asIssuer();
        givenOpenLoc();
        renderAndExpectMatchWith(itemFactory("ACKNOWLEDGED", ISSUER), undefined);
    });

    it("can be submitted for review or deleted by issuer when draft", () => {
        asIssuer();
        givenOpenLoc();
        renderAndExpectMatchWith(itemFactory("DRAFT", ISSUER), "VerifiedIssuer");
    });

    it("can be published or deleted by requester when approved and submitted by issuer", () => {
        asIssuer();
        givenOpenLoc();
        renderAndExpectMatchWith(itemFactory("REVIEW_ACCEPTED", ISSUER), "Requester");
    });

    it("can be acknowledged by issuer when published", () => {
        asIssuer();
        givenOpenLoc();
        renderAndExpectMatchWith(itemFactory("PUBLISHED", ISSUER), "VerifiedIssuer");
    });
}

function asRequester() {
    setViewer("User");
    setCurrentAddress({
        accountId: REQUESTER,
        isLegalOfficer: false,
        name: "",
    });
}

const REQUESTER = TEST_WALLET_USER;

function givenOpenLoc() {
    setLocRequest({
        id: new UUID("c34b8164-9c4a-41d5-9228-37273da97435"),
        status: "OPEN",
        requesterAddress: TEST_WALLET_USER,
        locType: "Transaction",
    });
}

function publicDataItem(status: ItemStatus, submitter: ValidAccountId) {
    const data: MergedMetadataItem = {
        name: HashString.fromValue("Name"),
        value: HashString.fromValue("Value"),
        acknowledgedByOwner: status === "ACKNOWLEDGED",
        acknowledgedByVerifiedIssuer: false,
        published: status === "PUBLISHED" || status === "ACKNOWLEDGED",
        status,
        submitter,
    };
    return createMetadataItem(data);
}

function renderAndExpectMatchWith(item: ItemAndRefreshFlag, contributionMode: ContributionMode | undefined) {
    const snapshot = shallowRender(<CustomItemActions locItem={ item.locItem } contributionMode={ contributionMode } />);
    expect(snapshot).toMatchSnapshot();
}

function asLegalOfficer() {
    setViewer("LegalOfficer");
    setCurrentAddress({
        accountId: OWNER,
        isLegalOfficer: false,
        name: "",
    });
}

const OWNER = DEFAULT_LEGAL_OFFICER;

function asIssuer() {
    setViewer("User");
    setCurrentAddress({
        accountId: ISSUER,
        isLegalOfficer: false,
        name: "",
    });
}

const ISSUER = TEST_WALLET_USER2;

function privateFileItem(status: ItemStatus, submitter: ValidAccountId) {
    const data: MergedFile = {
        hash: Hash.of("test"),
        nature: HashString.fromValue("Some nature"),
        name: "test.txt",
        restrictedDelivery: false,
        contentType: "text/plain",
        submitter,
        size: 4n,
        acknowledgedByOwner: status === "ACKNOWLEDGED",
        acknowledgedByVerifiedIssuer: false,
        published: status === "PUBLISHED" || status === "ACKNOWLEDGED",
        status,
    };
    return createFileItem(data);
}

function linkItem(status: ItemStatus, submitter: ValidAccountId) {
    const data: LinkData = {
        linkDetailsPath: "",
        linkedLoc: {} as LocData,
        nature: "Some nature"
    };
    const link: MergedLink = {
        target: new UUID("2743b19c-3acf-4e96-bd04-c384d168fa41"),
        nature: HashString.fromValue("Some nature"),
        submitter,
        acknowledgedByOwner: status === "ACKNOWLEDGED",
        acknowledgedByVerifiedIssuer: false,
        published: status === "PUBLISHED" || status === "ACKNOWLEDGED",
        status,
    };
    return createLinkItem(data, link);
}
