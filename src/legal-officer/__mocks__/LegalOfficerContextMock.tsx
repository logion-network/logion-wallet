import { LocsState, Votes } from "@logion/client";
import { LegalOfficerData } from "@logion/node-api";
import { PATRICK } from "src/common/TestData";
import { Locs } from "src/loc/Locs";

export let refreshRequests = jest.fn();

export let pendingProtectionRequests: any[] | null = null;

export let activatedProtectionRequests: any[] | null = null;

export let protectionRequestsHistory: any[] | null = null;

export let pendingRecoveryRequests: any[] | null = null;

export let recoveryRequestsHistory: any[] | null = null;

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

const locs = {
    Identity: Locs.empty("LegalOfficer"),
    Collection: Locs.empty("LegalOfficer"),
    Transaction: Locs.empty("LegalOfficer"),
};

export function useLegalOfficerContext() {
    return {
        refreshRequests,
        pendingProtectionRequests,
        activatedProtectionRequests,
        protectionRequestsHistory,
        axios: {},
        pendingRecoveryRequests,
        refreshLocs,
        legalOfficer,
        refreshLegalOfficer,
        onchainSettings,
        refreshOnchainSettings,
        locsState,
        locs,
        votes,
        mutateLocsState,
        mutateVotes,
    };
}
