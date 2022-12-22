import { LocData, LocRequestStatus } from "@logion/client";
import { UUID } from "@logion/node-api";
import { Viewer } from "src/common/CommonContext";

import { shallowRender } from "src/tests";
import CertificateAndLimits from "./CertificateAndLimits";

jest.mock("../logion-chain");

describe("CertificateAndLimits", () => {

    it("renders certificate and buttons for non-collection LOC and LO", () => {
        const loc = transactionLocMock();
        testCertiticateAndLimits(loc, "LegalOfficer");
    })

    it("renders only certificate and SoF request button for non-collection LOC and User", () => {
        const loc = transactionLocMock();
        testCertiticateAndLimits(loc, "User");
    })

    it("renders certificate, limits and buttons for open collection LOC and LO", () => {
        const loc = collectionLocMock("OPEN", false);
        testCertiticateAndLimits(loc, "LegalOfficer");
    })

    it("renders certificate, limits and buttons for closed non-void collection LOC and LO", () => {
        const loc = collectionLocMock("CLOSED", false);
        testCertiticateAndLimits(loc, "LegalOfficer");
    })

    it("renders certificate, limits and settings button for closed non-void collection LOC and User", () => {
        const loc = collectionLocMock("CLOSED", false);
        testCertiticateAndLimits(loc, "User");
    })

    it("renders certificate, limits and buttons for void collection LOC and LO", () => {
        const loc = collectionLocMock("CLOSED", true);
        testCertiticateAndLimits(loc, "LegalOfficer");
    })

    it("renders certificate and limits for void collection LOC and User", () => {
        const loc = collectionLocMock("CLOSED", true);
        testCertiticateAndLimits(loc, "User");
    })
})

const id = new UUID("1766ac27-d3c9-45e6-9b01-c364981b53a2");

function transactionLocMock(): LocData {
    return {
        id,
        locType: "Transaction",
    } as unknown as LocData;
}

function testCertiticateAndLimits(loc: LocData, viewer: Viewer) {
    const element = shallowRender(<CertificateAndLimits loc={ loc } viewer={ viewer } isReadOnly={ false } />);
    expect(element).toMatchSnapshot();
}

function collectionLocMock(status: LocRequestStatus, voidLoc: boolean): LocData {
    const loc = {
        id,
        status,
        closed: status === "CLOSED",
        locType: "Collection",
    } as unknown as LocData;

    if(voidLoc) {
        loc.voidInfo = {};
    }

    return loc;
}
