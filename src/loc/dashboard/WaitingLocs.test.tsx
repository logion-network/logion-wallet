import { shallowRender } from "src/tests";
import WaitingLocs from "./WaitingLocs";
import { LocRequestState, LocRequestStatus } from "@logion/client";
import { ValidAccountId } from "@logion/node-api";
import { DateTime } from "luxon";
import { PATRICK } from "src/common/TestData";
import { setViewer } from "src/common/__mocks__/CommonContextMock";

jest.mock("src/common/CommonContext");

describe("WaitingLocs", () => {

    it("renders for user", () => {
        setViewer("User");
        const locs = [
            mockLoc({
                ownerAccountId: PATRICK.account,
                createdOn: DateTime.fromISO("2024-03-19T16:00:00Z", {zone: 'utc'}),
                status: "REVIEW_PENDING",
            }),
        ];
        const element = shallowRender(<WaitingLocs locDetailsPath={ () => "" } locs={ locs } />);
        expect(element).toMatchSnapshot();
    });

    it("renders for LLO", () => {
        setViewer("LegalOfficer");
        const locs = [
            mockLoc({
                userIdentity: {},
                createdOn: DateTime.fromISO("2024-03-19T16:00:00Z", {zone: 'utc'}),
                status: "REVIEW_ACCEPTED",
            }),
        ];
        const element = shallowRender(<WaitingLocs locDetailsPath={ () => "" } locs={ locs } />);
        expect(element).toMatchSnapshot();
    });
});

function mockLoc(args: {
    ownerAccountId?: ValidAccountId,
    userIdentity?: object,
    status: LocRequestStatus,
    createdOn: DateTime,
}): LocRequestState {
    return {
        data: () => args,
    } as unknown as LocRequestState;
}
