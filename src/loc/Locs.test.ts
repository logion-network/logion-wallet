import { LocRequestState, LocRequestStatus } from "@logion/client";
import { Locs } from "./Locs";
import { DateTime } from "luxon";
import { UUID } from "@logion/node-api";

fdescribe("Locs", () => {

    it("creates empty for user", () => {
        const locs = Locs.empty("User");
        expect(locs.workInProgress.length).toBe(0);
        expect(locs.waiting.length).toBe(0);
        expect(locs.completed.length).toBe(0);
    });

    it("builds for user", () => {
        const requests = mockAllLocs();
        const locs = new Locs(requests, "User");

        expectLocs(locs.workInProgress, USER_WORK_IN_PROGRESS);
        expectLocs(locs.waiting, USER_WAITING);
        expectLocs(locs.completed, COMPLETED);
    });

    it("builds for LLO", () => {
        const requests = mockAllLocs();
        const locs = new Locs(requests, "LegalOfficer");

        expectLocs(locs.workInProgress, LLO_WORK_IN_PROGRESS);
        expectLocs(locs.waiting, LLO_WAITING);
        expectLocs(locs.completed, COMPLETED);
    });
});

function mockAllLocs() {
    return [
        mockLoc({
            id: DRAFT_LOC_ID,
            status: "DRAFT",
            createdOn: DateTime.fromISO("2024-03-19T13:13:00"),
        }),
        mockLoc({
            id: OPEN_WITH_NO_ITEM_LOC_ID,
            status: "OPEN",
            createdOn: DateTime.fromISO("2024-03-19T14:13:00"),
        }),
        mockLoc({
            id: CLOSED_ID,
            status: "CLOSED",
            createdOn: DateTime.fromISO("2024-03-19T14:13:00"),
            closedOn: DateTime.fromISO("2024-03-19T15:13:00"),
        }),
        mockLoc({
            id: VOID_OPEN_ID,
            status: "OPEN",
            createdOn: DateTime.fromISO("2024-03-19T16:13:00"),
            voidInfo: {
                voidedOn: DateTime.fromISO("2024-03-19T17:13:00"),
            }
        }),
        mockLoc({
            id: OPEN_WITH_UNPUBLISHED_META_ID,
            status: "OPEN",
            createdOn: DateTime.fromISO("2024-03-19T18:13:00"),
            metadata: [ false ],
        }),
        mockLoc({
            id: OPEN_WITH_UNPUBLISHED_FILE_ID,
            status: "OPEN",
            createdOn: DateTime.fromISO("2024-03-19T19:13:00"),
            files: [ false ],
        }),
        mockLoc({
            id: OPEN_WITH_UNPUBLISHED_LINK_ID,
            status: "OPEN",
            createdOn: DateTime.fromISO("2024-03-19T20:13:00"),
            links: [ false ],
        }),
        mockLoc({
            id: OPEN_WITH_ALL_PUBLISHED_ID,
            status: "OPEN",
            createdOn: DateTime.fromISO("2024-03-19T20:13:00"),
            metadata: [ true ],
            files: [ true ],
            links: [ true ],
        }),
        mockLoc({
            id: ACCEPTED_ID,
            status: "REVIEW_ACCEPTED",
            createdOn: DateTime.fromISO("2024-03-19T21:13:00"),
        }),
        mockLoc({
            id: REJECTED_ID,
            status: "REVIEW_REJECTED",
            createdOn: DateTime.fromISO("2024-03-19T22:13:00"),
        }),
        mockLoc({
            id: PENDING_ID,
            status: "REVIEW_PENDING",
            createdOn: DateTime.fromISO("2024-03-19T23:13:00"),
        }),
    ].sort(() => .5 - Math.random());
}

function mockLoc(args: {
    id: UUID,
    status: LocRequestStatus,
    createdOn: DateTime,
    voidInfo?: { voidedOn: DateTime },
    closedOn?: DateTime,
    metadata?: boolean[],
    files?: boolean[],
    links?: boolean[],
}): LocRequestState {
    return {
        data: () => ({
            id: args.id,
            status: args.status,
            createdOn: args.createdOn,
            voidInfo: args.voidInfo !== undefined ? { voidedOn: args.voidInfo.voidedOn.toISO() } : undefined,
            closedOn: args.closedOn,
            metadata: args.metadata !== undefined ? args.metadata.map(published => ({ published })) : [],
            files: args.files !== undefined ? args.files.map(published => ({ published })) : [],
            links: args.links !== undefined ? args.links.map(published => ({ published })) : [],
        }),
    } as unknown as LocRequestState;
}

function expectLocs(locs: LocRequestState[], expected: UUID[]) {
    expect(locs.length).toBe(expected.length);
    for(let i = 0; i < locs.length; ++i) {
        expect(locs[i].data().id).toEqual(expected[i]);
    }
}

const DRAFT_LOC_ID = new UUID();
const OPEN_WITH_UNPUBLISHED_META_ID = new UUID();
const OPEN_WITH_UNPUBLISHED_FILE_ID = new UUID();
const OPEN_WITH_UNPUBLISHED_LINK_ID = new UUID();
const ACCEPTED_ID = new UUID();
const REJECTED_ID = new UUID();

const USER_WORK_IN_PROGRESS = [
    DRAFT_LOC_ID,
    OPEN_WITH_UNPUBLISHED_META_ID,
    OPEN_WITH_UNPUBLISHED_FILE_ID,
    OPEN_WITH_UNPUBLISHED_LINK_ID,
    ACCEPTED_ID,
    REJECTED_ID,
];

const OPEN_WITH_NO_ITEM_LOC_ID = new UUID();
const OPEN_WITH_ALL_PUBLISHED_ID = new UUID();
const PENDING_ID = new UUID();

const USER_WAITING = [
    OPEN_WITH_NO_ITEM_LOC_ID,
    OPEN_WITH_ALL_PUBLISHED_ID,
    PENDING_ID,
];

const CLOSED_ID = new UUID();
const VOID_OPEN_ID = new UUID();

const COMPLETED = [
    VOID_OPEN_ID,
    CLOSED_ID,
];

const LLO_WORK_IN_PROGRESS = USER_WAITING.filter(locId => !locId.equalTo(DRAFT_LOC_ID));
const LLO_WAITING = USER_WORK_IN_PROGRESS;
