import { DEFAULT_LEGAL_OFFICER } from "../../common/TestData";
import { TEST_WALLET_USER } from '../TestData';
import {ApiPromise} from '@polkadot/api';
import { ProtectionRequest } from "../../common/types/ModelTypes";
import { DARK_MODE } from '../Types';
import { RecoveryConfig } from "../../logion-chain/Recovery";

export let createTokenRequest = () => null;

export let refreshRequests = jest.fn();

export let createProtectionRequest = () => null;

export let pendingProtectionRequests: ProtectionRequest[] | null = null;

export let acceptedProtectionRequests: ProtectionRequest[] | null = null;

export let api = new ApiPromise();

export let recoveryConfig: RecoveryConfig | undefined = undefined;

export let setUserAddress = jest.fn();

export let userAddress = TEST_WALLET_USER;

export let recoveredAddress: string | null = null;

export function useUserContext() {
    return {
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
        userAddress,
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

export function setRecoveryConfig(config: RecoveryConfig | undefined) {
    recoveryConfig = config;
}

export function UserContextProvider() {
    return (
        <div/>
    );
}

export function setContextUserAddress(address: string) {
    userAddress = address;
}

export function setRecoveredAddress(value: string) {
    recoveredAddress = value;
}
