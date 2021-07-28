import {TokenizationRequest} from "../../legal-officer/Types";
import {DEFAULT_LEGAL_OFFICER} from "../../common/types/LegalOfficer";
import { TEST_WALLET_USER } from '../TestData';
import {ApiPromise} from '@polkadot/api';
import {ProtectionRequest} from "../../legal-officer/Types";
import { DARK_MODE } from '../Types';

export let createTokenRequest = () => null;

export let createdTokenRequest: TokenizationRequest | null = null;

export let pendingTokenizationRequests: TokenizationRequest[] | null = null;

export let acceptedTokenizationRequests: TokenizationRequest[] | null = null;

export let rejectedTokenizationRequests: TokenizationRequest[] | null = null;

export let refreshRequests = jest.fn();

export let createProtectionRequest = () => null;

export let pendingProtectionRequests: ProtectionRequest[] | null = null;

export let acceptedProtectionRequests: ProtectionRequest[] | null = null;

export let api = new ApiPromise();

export let recoveryConfig = {isEmpty: true};

export let setUserAddress = jest.fn();

export let userAddress = TEST_WALLET_USER;

export let recoveredAddress: string | null = null;

export let balances: any = null;

export let transactions: any = null;

export function useUserContext() {
    return {
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
        userAddress,
        createTokenRequest,
        createdTokenRequest,
        pendingTokenizationRequests,
        acceptedTokenizationRequests,
        rejectedTokenizationRequests,
        refreshRequests,
        createProtectionRequest,
        pendingProtectionRequests,
        acceptedProtectionRequests,
        recoveryConfig,
        api,
        setUserAddress,
        colorTheme: DARK_MODE,
        recoveredAddress,
        balances,
        transactions,
    };
}

export function setCreateTokenRequest(callback: any) {
    createTokenRequest = callback;
}

export function setCreatedTokenRequest(request: TokenizationRequest) {
    createdTokenRequest = request;
}

export function setPendingRequests(requests: TokenizationRequest[]) {
    pendingTokenizationRequests = requests;
}

export function setRejectedRequests(requests: TokenizationRequest[]) {
    rejectedTokenizationRequests = requests;
}

export function setAcceptedRequests(requests: TokenizationRequest[]) {
    acceptedTokenizationRequests = requests;
}

export function setRefreshRequests(func: any) {
    refreshRequests = func;
}

export function setPendingProtectionRequests(requests: ProtectionRequest[] | null) {
    pendingProtectionRequests = requests;
}

export function setAcceptedProtectionRequests(requests: ProtectionRequest[] | null) {
    acceptedProtectionRequests = requests;
}

export function setCreateProtectionRequest(callback: any) {
    createProtectionRequest = callback;
}

export function setRecoveryConfig(config: any) {
    recoveryConfig = config;
}

export function UserContextProvider() {
    return (
        <div></div>
    );
}

export function setContextUserAddress(address: string) {
    userAddress = address;
}

export function setRecoveredAddress(value: string) {
    recoveredAddress = value;
}

export function setBalances(value: any) {
    balances = value;
}

export function setTransactions(value: any) {
    transactions = value;
}