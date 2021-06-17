import {DEFAULT_LEGAL_OFFICER, TokenizationRequest} from "../../legal-officer/Types";
import {TEST_WALLET_USER} from "../Model.test";
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

export let recoveryConfig = null;

export let setUserAddress = jest.fn();

export let userAddress = TEST_WALLET_USER;

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