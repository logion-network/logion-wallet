import { Mock } from 'moq.ts';
import { AxiosInstance } from 'axios';
import moment from 'moment';

import { TEST_WALLET_USER } from '../../wallet-user/TestData';
import { COLOR_THEME, DEFAULT_LEGAL_OFFICER } from '../TestData';
import Accounts, { Account } from '../types/Accounts';

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

export let pendingLocRequests: any[] | null = null;

export let rejectedLocRequests: any[] | null = null;

export let openedLocRequests: any[] | null = null;

export let closedLocRequests: any[] | null = null;

export let refresh = jest.fn();

export function useCommonContext() {
    return {
        selectAddress,
        accounts,
        balances,
        transactions,
        colorTheme: COLOR_THEME,
        setColorTheme,
        axiosFactory: () => axiosMock.object(),
        setTokens: jest.fn(),
        pendingLocRequests,
        rejectedLocRequests,
        openedLocRequests,
        closedLocRequests,
        refresh,
    };
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
    rejectedLocRequests = requests;
}

export function setOpenedLocRequests(requests: any[]) {
    openedLocRequests = requests;
}

export function setPendingLocRequests(requests: any[]) {
    pendingLocRequests = requests;
}

export function setClosedLocRequests(requests: any[]) {
    closedLocRequests = requests;
}
