import { TEST_WALLET_USER } from '../../wallet-user/TestData';
import { COLOR_THEME } from '../TestData';
import Addresses, { AccountAddress } from '../types/Addresses';

export let selectAddress = jest.fn();

export let currentAddress = TEST_WALLET_USER;

export function setCurrentAddress(address: string) {
    currentAddress = address;
}

const DEFAULT_ACCOUNT: AccountAddress = {
    name: "name",
    address: TEST_WALLET_USER,
    isLegalOfficer: false,
}

export let addresses: Addresses = {
    currentAddress: DEFAULT_ACCOUNT,
    addresses: [ DEFAULT_ACCOUNT ]
}

export let balances: any = null;

export let transactions: any = null;

export function useCommonContext() {
    return {
        currentAddress,
        selectAddress,
        addresses,
        balances,
        transactions,
        colorTheme: COLOR_THEME,
    };
}

export function setAddresses(value: Addresses) {
    addresses = value;
}

export function setBalances(value: any) {
    balances = value;
}

export function setTransactions(value: any) {
    transactions = value;
}
