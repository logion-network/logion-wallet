import { HashString, ItemStatus, LocData, MergedFile, MergedLink, MergedMetadataItem } from "@logion/client";
import { UUID, Hash, ValidAccountId } from "@logion/node-api";
import { shallowRender } from "../tests";
import { createDocumentTemplateItem, createLinkTemplateItem, createMetadataTemplateItem } from "./LocItemFactory";
import { TEST_WALLET_USER, TEST_WALLET_USER2 } from "../wallet-user/TestData";
import { setLocRequest } from "./__mocks__/LocContextMock";
import { setViewer } from "src/common/__mocks__/CommonContextMock";
import { ContributionMode } from "./types";
import { LinkData, LocItem } from "./LocItem";
import { setCurrentAddress } from "src/logion-chain/__mocks__/LogionChainMock";
import { DEFAULT_LEGAL_OFFICER } from "src/__mocks__/LogionMock";
import { LocTemplateDocumentOrLink, LocTemplateMetadataItem } from "./Template";
import TemplateItemActions from "./TemplateItemActions";

jest.mock("./LocContext");
jest.mock("../common/CommonContext");
jest.mock("../logion-chain");

describe("TemplateItemActions", () => {

    describe("Public data", () => tests(publicDataItem));
    describe("Private files", () => tests(privateFileItem));
    describe("Links", () => tests(linkItem));
});

function tests(itemFactory: (status: ItemStatus | undefined, submitter: ValidAccountId) => LocItem) {

    it("can be set by requester when empty", () => {
        asRequester();
        givenOpenLoc();
        renderAndExpectMatchWith(itemFactory(undefined, REQUESTER), "Requester");
    });

    it("can be submitted for review or cleared by requester when draft", () => {
        asRequester();
        givenOpenLoc();
        renderAndExpectMatchWith(itemFactory("DRAFT", REQUESTER), "Requester");
    });

    it("can be reviewed by owner when submitted", () => {
        asLegalOfficer();
        givenOpenLoc();
        renderAndExpectMatchWith(itemFactory("REVIEW_PENDING", REQUESTER), undefined);
    });

    it("can be published or cleared by requester when approved", () => {
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

    it("can be submitted for review or cleared by issuer when draft", () => {
        asIssuer();
        givenOpenLoc();
        renderAndExpectMatchWith(itemFactory("DRAFT", ISSUER), "VerifiedIssuer");
    });

    it("can be published or cleared by requester when approved and submitted by issuer", () => {
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

function publicDataItem(status: ItemStatus | undefined, submitter: ValidAccountId) {
    const template: LocTemplateMetadataItem = {
        name: "Some template data"
    };
    let data: MergedMetadataItem | undefined;
    if(status !== undefined) {
        data = {
            name: HashString.fromValue("Name"),
            value: HashString.fromValue("Value"),
            acknowledgedByOwner: status === "ACKNOWLEDGED",
            acknowledgedByVerifiedIssuer: false,
            published: status === "PUBLISHED" || status === "ACKNOWLEDGED",
            status,
            submitter,
        };
    }
    return createMetadataTemplateItem(template, data);
}

function renderAndExpectMatchWith(item: LocItem, contributionMode: ContributionMode | undefined) {
    const snapshot = shallowRender(<TemplateItemActions item={ item } contributionMode={ contributionMode } />);
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

function privateFileItem(status: ItemStatus | undefined, submitter: ValidAccountId) {
    const template: LocTemplateDocumentOrLink = {
        publicDescription: "Some public description"
    };
    let data: MergedFile | undefined;
    if(status !== undefined) {
        data = {
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
    }
    return createDocumentTemplateItem(template, data);
}

function linkItem(status: ItemStatus | undefined, submitter: ValidAccountId) {
    const template: LocTemplateDocumentOrLink = {
        publicDescription: "Some public description"
    };
    let data: LinkData | undefined;
    let link: MergedLink | undefined;
    if(status !== undefined) {
        data = {
            linkDetailsPath: "",
            linkedLoc: {} as LocData,
            nature: "Some nature"
        };
        link = {
            target: new UUID("2743b19c-3acf-4e96-bd04-c384d168fa41"),
            nature: HashString.fromValue("Some nature"),
            submitter,
            acknowledgedByOwner: status === "ACKNOWLEDGED",
            acknowledgedByVerifiedIssuer: false,
            published: status === "PUBLISHED" || status === "ACKNOWLEDGED",
            status,
        };
    }
    return createLinkTemplateItem(template, link, data);
}
