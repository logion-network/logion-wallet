import {DEFAULT_LEGAL_OFFICER} from "../../legal-officer/Model";
import {TEST_WALLET_USER} from "../Model.test";

export let createTokenRequest = () => null;

export function useUserContext() {
    return {
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
        userAddress: TEST_WALLET_USER,
        createTokenRequest
    };
}

export function setCreateTokenRequest(callback: any) {
    createTokenRequest = callback;
}
