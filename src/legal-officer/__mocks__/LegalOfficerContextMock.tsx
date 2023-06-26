import { ClosedCollectionLoc, ClosedLoc, OpenLoc, PendingRequest, RejectedRequest, VoidedLoc, LocsState, SignCallback, Votes, Vote, VoteResult } from "@logion/client";
import { LocType, IdentityLocType, LegalOfficerData } from "@logion/node-api";
import { ISubmittableResult } from '@polkadot/types/types';
import { AxiosInstance } from "axios";
import { COLOR_THEME, PATRICK } from "src/common/TestData";

export let pendingTokenizationRequests: any[] | null = null;

export let rejectRequest = () => {

};

export let tokenizationRequestsHistory: any[] | null = null;

export let refreshRequests = jest.fn();

export let pendingProtectionRequests: any[] | null = null;

export let activatedProtectionRequests: any[] | null = null;

export let protectionRequestsHistory: any[] | null = null;

export let pendingRecoveryRequests: any[] | null = null;

export let recoveryRequestsHistory: any[] | null = null;

export function setPendingRequests(requests: any[]) {
    pendingTokenizationRequests = requests;
}

export function setRejectRequest(callback: any) {
    rejectRequest = callback;
}

export function setTokenizationRequestsHistory(requests: any[]) {
    tokenizationRequestsHistory = requests;
}

export function setRefreshRequests(callback: any) {
    refreshRequests = callback;
}

export function setPendingProtectionRequests(requests: any[]) {
    pendingProtectionRequests = requests;
}

export function setActivatedProtectionRequests(requests: any[]) {
    activatedProtectionRequests = requests;
}

export function setProtectionRequestsHistory(requests: any[]) {
    protectionRequestsHistory = requests;
}

export function setPendingRecoveryRequests(requests: any[]) {
    pendingRecoveryRequests = requests;
}

export function setRecoveryRequestsHistory(requests: any[]) {
    recoveryRequestsHistory = requests;
}

export let pendingLocRequests: Record<LocType, PendingRequest[]> | null = null;
export let rejectedLocRequests: Record<LocType, RejectedRequest[]> | null = null;

export let openedLocRequests: Record<LocType, OpenLoc[]> | null = {
    "Transaction": [],
    "Collection": [],
    "Identity": [],
};

export let closedLocRequests: Record<LocType, (ClosedLoc | ClosedCollectionLoc)[]> | null = {
    "Transaction": [],
    "Collection": [],
    "Identity": [],
};

export let openedIdentityLocs: OpenLoc[] | null = null;

export let openedIdentityLocsByType: Record<IdentityLocType, OpenLoc[]> | null = null;

export let closedIdentityLocsByType: Record<IdentityLocType, ClosedLoc[]> | null = null;

export let voidIdentityLocsByType: Record<IdentityLocType, VoidedLoc[]> | null = null;

export function setRejectedLocRequests(requests: RejectedRequest[]) {
    rejectedLocRequests = { Collection: [], Transaction: requests, Identity: [] };
}

export function setOpenedLocRequests(requests: OpenLoc[]) {
    openedLocRequests = { Collection: [], Transaction: requests, Identity: [] };
}

export function setPendingLocRequests(requests: PendingRequest[]) {
    pendingLocRequests = { Collection: [], Transaction: requests, Identity: [] };
}

export function setClosedLocRequests(requests: ClosedLoc[]) {
    closedLocRequests = { Collection: [], Transaction: requests, Identity: [] };
}

export function setOpenedIdentityLocs(requests: OpenLoc[]) {
    openedIdentityLocs = requests;
}

export function setOpenedIdentityLocsByType(locs: Record<IdentityLocType, OpenLoc[]>) {
    openedIdentityLocsByType = locs;
}

export function setClosedIdentityLocsByType(locs: Record<IdentityLocType, ClosedLoc[]>) {
    closedIdentityLocsByType = locs;
}

export function setVoidedIdentityLocsByType(locs: Record<IdentityLocType, VoidedLoc[]>) {
    voidIdentityLocsByType = locs;
}

let onchainSettings: LegalOfficerData = {};

export function setOnchainSettings(settings: LegalOfficerData) {
    onchainSettings = settings;
}

export let refreshLocs = jest.fn();

let legalOfficer = PATRICK;

let refreshLegalOfficer = jest.fn();

export let refreshOnchainSettings = jest.fn();

let locsState: LocsState = {
    findById: () => { throw new Error("not found") },
} as unknown as LocsState;

export function setLocsState(mock: LocsState) {
    locsState = mock;
}

async function vote(params: {
    targetVote: Vote,
    myVote: VoteResult,
    callback: SignCallback
}): Promise<Vote> {
    params.callback({
        status: {
            isFinalized: true,
        }
    } as ISubmittableResult);
    return params.targetVote;
}

let votes: Votes;

export function setVotes(value: Votes) {
    votes = value;
}

async function mutateLocsState(mutator: (current: LocsState) => Promise<LocsState>): Promise<void> {
    await mutator(locsState);
}

async function mutateVotes(mutator: (current: Votes) => Promise<Votes>): Promise<void> {
    votes = await mutator(votes);
}

export function useLegalOfficerContext() {
    return {
        pendingTokenizationRequests,
        rejectRequest,
        tokenizationRequestsHistory,
        refreshRequests,
        pendingProtectionRequests,
        activatedProtectionRequests,
        protectionRequestsHistory,
        colorTheme: COLOR_THEME,
        openedLocRequests,
        openedIdentityLocs,
        openedIdentityLocsByType,
        closedLocRequests,
        closedIdentityLocsByType,
        pendingLocRequests,
        rejectedLocRequests,
        voidIdentityLocsByType,
        axios: {} as AxiosInstance,
        onchainSettings,
        pendingRecoveryRequests,
        refreshLocs,
        legalOfficer,
        refreshLegalOfficer,
        refreshOnchainSettings,
        locsState,
        votes,
        mutateLocsState,
        mutateVotes,
    };
}
