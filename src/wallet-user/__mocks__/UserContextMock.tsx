import {DEFAULT_LEGAL_OFFICER} from "../../common/types/LegalOfficer";
import { TEST_WALLET_USER } from '../TestData';
import {ApiPromise} from '@polkadot/api';
import {TokenizationRequest, ProtectionRequest} from "../../common/types/ModelTypes";
import { DARK_MODE } from '../Types';

export let createTokenRequest = () => null;

export let createdTokenRequest: TokenizationRequest | null = null;

export let pendingTokenizationRequests: TokenizationRequest[] | null = null;

export let tokenizationRequestsHistory: TokenizationRequest[] | null = null;

export let refreshRequests = jest.fn();

export let createProtectionRequest = () => null;

export let pendingProtectionRequests: ProtectionRequest[] | null = null;

export let acceptedProtectionRequests: ProtectionRequest[] | null = null;

export let api = new ApiPromise();

export let recoveryConfig = {isEmpty: true};

export let setUserAddress = jest.fn();

export let userAddress = TEST_WALLET_USER;

export let recoveredAddress: string | null = null;

export function useUserContext() {
    return {
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
        userAddress,
        createTokenRequest,
        createdTokenRequest,
        pendingTokenizationRequests,
        tokenizationRequestsHistory,
        refreshRequests,
        createProtectionRequest,
        pendingProtectionRequests,
        acceptedProtectionRequests,
        recoveryConfig,
        api,
        setUserAddress,
        colorTheme: DARK_MODE,
        recoveredAddress,
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

export function setTokenizationRequestsHistory(requests: TokenizationRequest[]) {
    tokenizationRequestsHistory = requests;
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
