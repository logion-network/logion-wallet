import { IdentityLocType, DataLocType } from "@logion/node-api/dist/Types";

import { COLOR_THEME, legalOfficers } from '../TestData';
import { CommonContext, RequestAndLoc } from "../CommonContext";
import { BalanceState } from "@logion/client/dist/Balance";

export let setColorTheme = jest.fn();

export let pendingLocRequests: Record<DataLocType, any[]> | null = null;

export let rejectedLocRequests: Record<DataLocType, any[]> | null = null;

export let openedLocRequests: Record<DataLocType, any[]> | null = null;

export let closedLocRequests: Record<DataLocType, any[]> | null = null;

export let openedIdentityLocs: RequestAndLoc[] | null = null;

export let refresh = jest.fn();

let openedIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null = null;

let closedIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null = null;

let voidIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null = null;

export let balanceState: BalanceState | undefined = {} as BalanceState;

export function setBalanceState(value: BalanceState | undefined) {
    balanceState = value;
}

export function useCommonContext() {
    const commonContext:Partial<CommonContext> = {
        balanceState,
        colorTheme: COLOR_THEME,
        setColorTheme,
        pendingLocRequests,
        rejectedLocRequests,
        openedLocRequests,
        closedLocRequests,
        refresh,
        nodesUp: [],
        nodesDown: [],
        openedIdentityLocsByType,
        closedIdentityLocsByType,
        voidIdentityLocsByType,
        openedIdentityLocs,
        availableLegalOfficers: legalOfficers
    };
    return commonContext;
}

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
