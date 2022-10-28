import { LocData, LocRequestStatus, LocRequestState } from "@logion/client";
import { LocType, UUID } from "@logion/node-api";
import { Viewer } from "src/common/CommonContext";

import { CheckResult } from "src/components/checkfileframe/CheckFileFrame";
import { shallowRender } from "src/tests";
import LocDetailsTab, { LocDetailsTabContent } from "./LocDetailsTab";
import { setLocRequest, setLocState } from "./__mocks__/LocContextMock";

jest.mock("./LocContext");

describe("LocDetailsTab", () => {

    it("renders open transaction LOC for LO", () => testRender({
        locType: "Transaction",
        status: "OPEN",
        viewer: "LegalOfficer",
        voidLoc: false
    }))

    it("renders closed transaction LOC for LO", () => testRender({
        locType: "Transaction",
        status: "CLOSED",
        viewer: "LegalOfficer",
        voidLoc: false
    }))

    it("renders void transaction LOC for LO", () => testRender({
        locType: "Transaction",
        status: "OPEN",
        viewer: "LegalOfficer",
        voidLoc: true
    }))

    it("renders open logion identity LOC for LO", () => testRender({
        locType: "Identity",
        status: "OPEN",
        viewer: "LegalOfficer",
        voidLoc: false,
        isLogionIdentityLoc: true,
    }))

    it("renders open polkadot identity LOC for LO", () => testRender({
        locType: "Identity",
        status: "OPEN",
        viewer: "LegalOfficer",
        voidLoc: false
    }))

    it("renders open transaction LOC for User", () => testRender({
        locType: "Transaction",
        status: "OPEN",
        viewer: "User",
        voidLoc: false
    }))

    it("renders closed transaction LOC for User", () => testRender({
        locType: "Transaction",
        status: "CLOSED",
        viewer: "User",
        voidLoc: false
    }))

    it("renders void transaction LOC for User", () => testRender({
        locType: "Transaction",
        status: "OPEN",
        viewer: "User",
        voidLoc: true
    }))

    it("renders open logion identity LOC for User", () => testRender({
        locType: "Identity",
        status: "OPEN",
        viewer: "User",
        voidLoc: false,
        isLogionIdentityLoc: true,
    }))

    it("renders open polkadot identity LOC for User", () => testRender({
        locType: "Identity",
        status: "OPEN",
        viewer: "User",
        voidLoc: false
    }))
})

describe("LocDetailsTabContent", () => {

    it("renders open data LOC for LO", () => testRenderContent({
        locType: "Transaction",
        status: "OPEN",
        viewer: "LegalOfficer",
        voidLoc: false
    }))

    it("renders closed data LOC for LO", () => testRenderContent({
        locType: "Transaction",
        status: "CLOSED",
        viewer: "LegalOfficer",
        voidLoc: false
    }))

    it("renders void data LOC for LO", () => testRenderContent({
        locType: "Transaction",
        status: "OPEN",
        viewer: "LegalOfficer",
        voidLoc: true
    }))

    it("renders open identity LOC for LO", () => testRenderContent({
        locType: "Identity",
        status: "OPEN",
        viewer: "LegalOfficer",
        voidLoc: false
    }))

    it("renders open data LOC for User", () => testRenderContent({
        locType: "Transaction",
        status: "OPEN",
        viewer: "User",
        voidLoc: false
    }))

    it("renders closed data LOC for User", () => testRenderContent({
        locType: "Transaction",
        status: "CLOSED",
        viewer: "User",
        voidLoc: false
    }))

    it("renders void data LOC for User", () => testRenderContent({
        locType: "Transaction",
        status: "OPEN",
        viewer: "User",
        voidLoc: true
    }))
})

interface MockParameters {
    voidLoc: boolean;
    status: LocRequestStatus;
    locType: LocType;
    viewer: Viewer;
    isLogionIdentityLoc?: boolean;
}

interface TestParameters extends MockParameters {
    viewer: Viewer;
}

function testRender(params: TestParameters) {
    const { loc, locState } = buildLocMock(params);
    const element = shallowRender(<LocDetailsTab
        loc={ loc }
        locState={ locState }
        viewer={ params.viewer }
        { ...otherProps }
    />);
    expect(element).toMatchSnapshot();
}

const otherProps = {
    detailsPath: () => "",
    checkResult: { result: "NONE" as CheckResult },
    locItems: [],
    addMetadata: () => {},
    addFile: () => Promise.resolve(),
    deleteFile: () => {},
    deleteMetadata: () => {},
    deleteLink: () => {},
};

const locId = new UUID("f0afbbbb-696d-4b77-8170-77e565888a0e");
const createdOn = "2022-09-28T07:49:00.000+02:00";
const closedOn = "2022-09-28T08:49:00.000+02:00";

function buildLocMock(params: MockParameters): { loc: LocData, locState: LocRequestState } {
    const loc = {
        id: locId,
        status: params.status,
        locType: params.locType,
        closed: params.status === "CLOSED",
        createdOn,
        closedOn: params.status === "CLOSED" ? closedOn : undefined,
    } as unknown as LocData;

    if(params.voidLoc) {
        loc.voidInfo = {

        };
    }

    const locState = {

        isLogionIdentity: () => params.isLogionIdentityLoc === true,
        isLogionData: () => params.locType === "Collection" || params.locType === "Transaction",
    } as unknown as LocRequestState;

    return { loc, locState };
}

function testRenderContent(params: TestParameters) {
    const { loc, locState } = buildLocMock(params);
    setLocRequest(loc);
    setLocState(locState);
    const element = shallowRender(<LocDetailsTabContent
        viewer={ params.viewer }
        locTabBorderColor={ "black" }
        { ...otherProps }
    />);
    expect(element).toMatchSnapshot();
}
