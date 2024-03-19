import { shallowRender } from "src/tests";
import CompletedLocs from "./CompletedLocs";
import { LocRequestState, LocRequestStatus } from "@logion/client";
import { DateTime } from "luxon";
import { PATRICK } from "src/common/TestData";
import { setViewer } from "src/common/__mocks__/CommonContextMock";

jest.mock("src/common/CommonContext");

describe("CompletedLocs", () => {

    it("renders for user", () => {
        setViewer("User");
        const locs = [
            mockLoc({
                ownerAddress: PATRICK.address,
                closedOn: DateTime.fromISO("2024-03-19T16:00:00"),
                status: "CLOSED",
            }),
            mockLoc({
                ownerAddress: PATRICK.address,
                closedOn: DateTime.fromISO("2024-03-19T16:00:00"),
                status: "OPEN",
                voidInfo: {},
            }),
        ];
        const element = shallowRender(<CompletedLocs locDetailsPath={ () => "" } locs={ locs } />);
        expect(element).toMatchSnapshot();
    });

    it("renders for LLO", () => {
        setViewer("LegalOfficer");
        const locs = [
            mockLoc({
                userIdentity: {},
                closedOn: DateTime.fromISO("2024-03-19T16:00:00"),
                status: "CLOSED",
            }),
            mockLoc({
                userIdentity: {},
                closedOn: DateTime.fromISO("2024-03-19T16:00:00"),
                status: "OPEN",
                voidInfo: {},
            }),
        ];
        const element = shallowRender(<CompletedLocs locDetailsPath={ () => "" } locs={ locs } />);
        expect(element).toMatchSnapshot();
    });
});

function mockLoc(args: {
    ownerAddress?: string,
    userIdentity?: object,
    status: LocRequestStatus,
    closedOn: DateTime,
    voidInfo?: object,
}): LocRequestState {
    return {
        data: () => args,
    } as unknown as LocRequestState;
}
