import moment from 'moment';

import { TEST_WALLET_USER } from '../../wallet-user/TestData';
import { DEFAULT_LEGAL_OFFICER } from '../types/LegalOfficer';
import { COLOR_THEME } from '../TestData';
import Addresses, { AccountAddress } from '../types/Addresses';

export let selectAddress = jest.fn();

export const DEFAULT_USER_ACCOUNT: AccountAddress = {
    name: "name",
    address: TEST_WALLET_USER,
    isLegalOfficer: false,
    token: {
        value: "token",
        expirationDateTime: moment(),
    },
}

export const DEFAULT_LEGAL_OFFICER_ACCOUNT: AccountAddress = {
    name: "name",
    address: DEFAULT_LEGAL_OFFICER,
    isLegalOfficer: true,
    token: {
        value: "token",
        expirationDateTime: moment(),
    },
}

export let addresses: Addresses | null = {
    currentAddress: DEFAULT_USER_ACCOUNT,
    addresses: [ DEFAULT_USER_ACCOUNT ]
}

export let balances: any = null;

export let transactions: any = null;

export let setColorTheme = jest.fn();

export function useCommonContext() {
    return {
        selectAddress,
        addresses,
        balances,
        transactions,
        colorTheme: COLOR_THEME,
        setColorTheme,
    };
}

export function setCurrentAddress(value: AccountAddress | undefined) {
    if(value === undefined) {
        addresses = {
            currentAddress: undefined,
            addresses: [ DEFAULT_USER_ACCOUNT ]
        };
    } else {
        addresses = {
            currentAddress: value,
            addresses: [ value ]
        };
    }
}

export function setAddresses(value: Addresses | null) {
    addresses = value;
}

export function setBalances(value: any) {
    balances = value;
}

export function setTransactions(value: any) {
    transactions = value;
}
