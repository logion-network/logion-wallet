import { ApiPromise } from '@polkadot/api';

import { GUILLAUME, PATRICK } from "../../common/TestData";
import { TEST_WALLET_USER } from '../TestData';
import { AccountTokens, DirectoryClient, NoProtection, ProtectionState } from '@logion/client';
import { AxiosFactory } from '@logion/client/dist/AxiosFactory';
import { ComponentFactory } from '@logion/client/dist/ComponentFactory';
import { LegalOfficerEndpoint, LogionClientConfig, SharedState } from '@logion/client/dist/SharedClient';
import { NetworkState } from '@logion/client/dist/NetworkState';
import { UserContext } from '../UserContext';
import { BalanceState } from '@logion/client/dist/Balance';
import { LocsState } from "@logion/client/dist/Loc";

export let createTokenRequest = () => null;

export let refreshRequests = jest.fn();

export let createProtectionRequest = jest.fn().mockReturnValue(Promise.resolve());

export let activateProtection = jest.fn().mockReturnValue(Promise.resolve());

export let claimRecovery = jest.fn().mockReturnValue(Promise.resolve());

export let api = new ApiPromise();

export const DEFAULT_SHARED_STATE: SharedState = {
    axiosFactory: {} as AxiosFactory,
    componentFactory: {} as ComponentFactory,
    config: {

    } as LogionClientConfig,
    directoryClient: {} as DirectoryClient,
    legalOfficers: [ PATRICK, GUILLAUME ],
    allLegalOfficers: [ PATRICK, GUILLAUME ],
    networkState: {} as NetworkState<LegalOfficerEndpoint>,
    nodeApi: api,
    tokens: {} as AccountTokens,
    currentAddress: TEST_WALLET_USER,
}

export let protectionState: ProtectionState | undefined = {} as NoProtection;

export function setProtectionState(state: ProtectionState | undefined) {
    protectionState = state;
}

export let recoveredBalanceState: BalanceState | undefined = {} as BalanceState;

export function setRecoveredBalanceState(state: BalanceState | undefined) {
    recoveredBalanceState = state;
}

export let mutateRecoveredBalanceState = jest.fn().mockReturnValue(Promise.resolve());

export let locsState: LocsState | undefined = new LocsState({} as SharedState);

export function setLocsState(state: LocsState | undefined) {
    locsState = state;
}

export function setOpenedLocRequests(requests: any[]) {
    locsState!.openLocs["Transaction"] = requests;
}

export function setClosedLocRequests(requests: any[]) {
    locsState!.closedLocs["Transaction"] = requests;
}

export function setVoidedLocs(requests: any[]) {
    locsState!.voidedLocs["Transaction"] = requests;
}

export function setPendingLocRequests(requests: any[]) {
    locsState!.pendingRequests["Transaction"] = requests;
}

export function setRejectedLocRequests(requests: any[]) {
    locsState!.rejectedRequests["Transaction"] = requests;
}

export let mutateLocsState = jest.fn().mockReturnValue(Promise.resolve());

export function useUserContext() {
    return {
        refreshRequests,
        createProtectionRequest,
        activateProtection,
        claimRecovery,
        protectionState,
        recoveredBalanceState,
        mutateRecoveredBalanceState,
        locsState,
        mutateLocsState
    } as Partial<UserContext>;
}

export function setCreateTokenRequest(callback: any) {
    createTokenRequest = callback;
}

export function setRefreshRequests(func: any) {
    refreshRequests = func;
}

export function setCreateProtectionRequest(callback: any) {
    createProtectionRequest = callback;
}

export function UserContextProvider() {
    return (
        <div/>
    );
}
