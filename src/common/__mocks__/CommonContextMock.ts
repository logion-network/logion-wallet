import { Mock } from 'moq.ts';
import { AxiosInstance } from 'axios';
import moment from 'moment';
import { IdentityLocType, DataLocType } from "@logion/node-api/dist/Types";

import { TEST_WALLET_USER } from '../../wallet-user/TestData';
import { COLOR_THEME, DEFAULT_LEGAL_OFFICER } from '../TestData';
import Accounts, { Account } from '../types/Accounts';
import { CommonContext, RequestAndLoc } from "../CommonContext";
import { legalOfficers } from '../../directory/DirectoryContextMock';

export let selectAddress = jest.fn();

export const DEFAULT_USER_ACCOUNT: Account = {
    name: "name",
    address: TEST_WALLET_USER,
    isLegalOfficer: false,
    token: {
        value: "token",
        expirationDateTime: moment(),
    },
}

export const DEFAULT_LEGAL_OFFICER_ACCOUNT: Account = {
    name: "name",
    address: DEFAULT_LEGAL_OFFICER,
    isLegalOfficer: true,
    token: {
        value: "token",
        expirationDateTime: moment(),
    },
}

export let accounts: Accounts | null = {
    current: DEFAULT_USER_ACCOUNT,
    all: [ DEFAULT_USER_ACCOUNT ]
}

export let balances: any = null;

export let transactions: any = null;

export let setColorTheme = jest.fn();

export let axiosMock = new Mock<AxiosInstance>();

export let pendingLocRequests: Record<DataLocType, any[]> | null = null;

export let rejectedLocRequests: Record<DataLocType, any[]> | null = null;

export let openedLocRequests: Record<DataLocType, any[]> | null = null;

export let closedLocRequests: Record<DataLocType, any[]> | null = null;

export let openedIdentityLocs: RequestAndLoc[] | null = null;

export let refresh = jest.fn();

export let authenticate = jest.fn();

let openedIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null = null;

let closedIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null = null;

let voidIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null = null;

export function useCommonContext() {
    const commonContext:Partial<CommonContext> = {
        selectAddress,
        accounts,
        balances,
        transactions,
        colorTheme: COLOR_THEME,
        setColorTheme,
        axiosFactory: () => axiosMock.object(),
        pendingLocRequests,
        rejectedLocRequests,
        openedLocRequests,
        closedLocRequests,
        refresh,
        authenticate,
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

export function setCurrentAddress(value: Account | undefined) {
    if(value === undefined) {
        accounts = {
            current: undefined,
            all: [ DEFAULT_USER_ACCOUNT ]
        };
    } else {
        accounts = {
            current: value,
            all: [ value ]
        };
    }
}

export function setAddresses(value: Accounts | null) {
    accounts = value;
}

export function setBalances(value: any) {
    balances = value;
}

export function setTransactions(value: any) {
    transactions = value;
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
