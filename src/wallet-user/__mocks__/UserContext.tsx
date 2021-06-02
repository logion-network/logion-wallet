import {DEFAULT_LEGAL_OFFICER, TokenizationRequest} from "../../legal-officer/Model";
import {TEST_WALLET_USER} from "../Model.test";
import {ApiPromise} from '@polkadot/api';

export let createTokenRequest = () => null;

export let createdTokenRequest: TokenizationRequest | null = null;

export let pendingTokenizationRequests: TokenizationRequest[] | null = null;

export let acceptedTokenizationRequests: TokenizationRequest[] | null = null;

export let rejectedTokenizationRequests: TokenizationRequest[] | null = null;

export let refreshRequests = jest.fn();

export let api = new ApiPromise();

export function useUserContext() {
    return {
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
        userAddress: TEST_WALLET_USER,
        createTokenRequest,
        createdTokenRequest,
        pendingTokenizationRequests,
        acceptedTokenizationRequests,
        rejectedTokenizationRequests,
        refreshRequests,
        api
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
