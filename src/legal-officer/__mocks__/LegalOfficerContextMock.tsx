import { DataLocType, IdentityLocType } from "@logion/node-api/dist/Types";
import { RequestAndLoc } from "../LegalOfficerContext";

export let pendingTokenizationRequests: any[] | null = null;

export let rejectRequest = () => {

};

export let tokenizationRequestsHistory: any[] | null = null;

export let refreshRequests = jest.fn();

export let pendingProtectionRequests: any[] | null = null;

export let activatedProtectionRequests: any[] | null = null;

export let protectionRequestsHistory: any[] | null = null;

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

export function setRecoveryRequestsHistory(requests: any[]) {
    recoveryRequestsHistory = requests;
}

export let pendingLocRequests: Record<DataLocType, any[]> | null = null;
export let rejectedLocRequests: Record<DataLocType, any[]> | null = null;

export let openedLocRequests: Record<DataLocType, any[]> | null = {
    "Transaction": [],
    "Collection": []
};

export let closedLocRequests: Record<DataLocType, any[]> | null = {
    "Transaction": [],
    "Collection": []
};

export let openedIdentityLocs: RequestAndLoc[] | null = null;

export let openedIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null = null;

export let closedIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null = null;

export let voidIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null = null;

export function setRejectedLocRequests(requests: any[]) {
    rejectedLocRequests = { Collection: [], Transaction: requests };
}

export function setOpenedLocRequests(requests: any[]) {
    openedLocRequests = { Collection: [], Transaction: requests };
}

export function setPendingLocRequests(requests: any[]) {
    pendingLocRequests = { Collection: [], Transaction: requests };
}

export function setClosedLocRequests(requests: any[]) {
    closedLocRequests = { Collection: [], Transaction: requests };
}

export function setOpenedIdentityLocs(requests: any[]) {
    openedIdentityLocs = requests;
}

export function setOpenedIdentityLocsByType(locs: Record<IdentityLocType, RequestAndLoc[]>) {
    openedIdentityLocsByType = locs;
}

export function setClosedIdentityLocsByType(locs: Record<IdentityLocType, RequestAndLoc[]>) {
    closedIdentityLocsByType = locs;
}

export function setVoidedIdentityLocsByType(locs: Record<IdentityLocType, RequestAndLoc[]>) {
    voidIdentityLocsByType = locs;
}
