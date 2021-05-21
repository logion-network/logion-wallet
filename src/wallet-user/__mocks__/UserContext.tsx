import {DEFAULT_LEGAL_OFFICER, TokenizationRequest} from "../../legal-officer/Model";
import {TEST_WALLET_USER} from "../Model.test";

export let createTokenRequest = () => null;

export let createdTokenRequest: TokenizationRequest | null = null;

export let rejectedTokenizationRequests: TokenizationRequest[] | null = null;

export function useUserContext() {
    return {
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
        userAddress: TEST_WALLET_USER,
        createTokenRequest,
        createdTokenRequest,
        rejectedTokenizationRequests,
    };
}

export function setCreateTokenRequest(callback: any) {
    createTokenRequest = callback;
}

export function setCreatedTokenRequest(request: TokenizationRequest) {
    createdTokenRequest = request;
}

export function setRejectedRequests(requests: TokenizationRequest[]) {
    rejectedTokenizationRequests = requests;
}