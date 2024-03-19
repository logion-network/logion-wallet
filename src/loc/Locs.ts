import { LocRequestState, LocsState } from "@logion/client";
import { LocType } from "@logion/node-api";
import { DateTime } from "luxon";
import { Viewer } from "src/common/CommonContext";

export function getLocsMap(locsState: LocsState, viewer: Viewer): Record<LocType, Locs> {
    return {
        Identity: new Locs(getAllLocs(locsState, "Identity"), viewer),
        Collection: new Locs(getAllLocs(locsState, "Collection"), viewer),
        Transaction: new Locs(getAllLocs(locsState, "Transaction"), viewer),
    };
}

export function getAllLocs(locsState: LocsState, locType: LocType): LocRequestState[] {
    return (locsState.draftRequests[locType] as LocRequestState[])
        .concat(locsState.acceptedRequests[locType])
        .concat(locsState.closedLocs[locType])
        .concat(locsState.openLocs[locType])
        .concat(locsState.pendingRequests[locType])
        .concat(locsState.rejectedRequests[locType])
        .concat(locsState.voidedLocs[locType])
    ;
}

export class Locs {

    static empty(viewer: Viewer) {
        return new Locs([], viewer);
    }

    constructor(allLocs: LocRequestState[], viewer: Viewer) {
        this.allLocs = allLocs;
        this.viewer = viewer;
        this._workInProgress = this.computeWorkInProgress(viewer);
        this._waiting = this.computeWaiting(viewer);
        this._completed = this.computeCompleted();
    }

    private allLocs: LocRequestState[];

    private viewer: Viewer;

    private _workInProgress: LocRequestState[];

    private _waiting: LocRequestState[];

    private _completed: LocRequestState[];

    private computeWorkInProgress(viewer: Viewer): LocRequestState[] {
        return this.allLocs.filter(loc => this.isWorkInProgress(loc, viewer)).sort(this.sortByIncreasingCreatedOn);
    }

    private isWorkInProgress(loc: LocRequestState, viewer: Viewer): boolean {
        if(viewer === "User") {
            return this.isUserWorkInProgress(loc);
        } else {
            return this.isLegalOfficerWorkInProgress(loc);
        }
    }

    private isUserWorkInProgress(loc: LocRequestState): boolean {
        const status = loc.data().status;
        return status === "DRAFT"
            || (status === "OPEN" && loc.data().voidInfo === undefined && this.hasUnpublishedItems(loc))
            || status === "REVIEW_ACCEPTED"
            || status === "REVIEW_REJECTED";
    }

    private hasUnpublishedItems(loc: LocRequestState): boolean {
        return (loc.data().metadata.find(item => !item.published) !== undefined)
            || (loc.data().files.find(item => !item.published) !== undefined)
            || (loc.data().links.find(item => !item.published) !== undefined)
        ;
    }

    private sortByIncreasingCreatedOn(a: LocRequestState, b: LocRequestState): number {
        return a.data().createdOn.diff(b.data().createdOn).milliseconds;
    }

    private isLegalOfficerWorkInProgress(loc: LocRequestState): boolean {
        const status = loc.data().status;
        return status === "REVIEW_PENDING"
            || (status === "OPEN" && loc.data().voidInfo === undefined && !this.hasUnpublishedItems(loc))
        ;
    }

    get workInProgress(): LocRequestState[] {
        return this._workInProgress;
    }

    private computeWaiting(viewer: Viewer): LocRequestState[] {
        return this.allLocs.filter(loc => this.isWaiting(loc, viewer)).sort(this.sortByIncreasingCreatedOn);
    }

    private isWaiting(loc: LocRequestState, viewer: Viewer): boolean {
        if(viewer === "User") {
            return this.isLegalOfficerWorkInProgress(loc);
        } else {
            return this.isUserWorkInProgress(loc);
        }
    }

    get waiting(): LocRequestState[] {
        return this._waiting;
    }

    private computeCompleted(): LocRequestState[] {
        return this.allLocs.filter(loc => this.isCompleted(loc)).sort(this.sortCompleted);
    }

    private isCompleted(loc: LocRequestState): boolean {
        return loc.data().status === "CLOSED" || loc.data().voidInfo !== undefined;
    }

    private sortCompleted(a: LocRequestState, b: LocRequestState): number {
        const voidedOnAString = a.data().voidInfo?.voidedOn;
        const voidedOnA = voidedOnAString ? DateTime.fromISO(voidedOnAString) : undefined;
        const closedOnA = a.data().closedOn;
        const dateA = voidedOnA !== undefined ? voidedOnA : (closedOnA ? closedOnA : a.data().createdOn);
        const voidedOnBString = b.data().voidInfo?.voidedOn;
        const voidedOnB = voidedOnBString ? DateTime.fromISO(voidedOnBString) : undefined;
        const closedOnB = b.data().closedOn;
        const dateB = voidedOnB !== undefined ? voidedOnB : (closedOnB ? closedOnB : a.data().createdOn);
        return dateB.diff(dateA).milliseconds;
    }

    get completed(): LocRequestState[] {
        return this._completed;
    }

    filter(predicate: (loc: LocRequestState) => boolean): Locs {
        const filtered = this.allLocs.filter(predicate);
        return new Locs(filtered, this.viewer);
    }
}
