import { ApiPromise } from '@polkadot/api';

import { GUILLAUME, PATRICK } from "../../common/TestData";
import { TEST_WALLET_USER } from '../TestData';
import { AccountTokens, DirectoryClient, NoProtection, ProtectionState, LegalOfficer, DraftRequest } from '@logion/client';
import { AxiosFactory } from '@logion/client/dist/AxiosFactory.js';
import { ComponentFactory } from '@logion/client/dist/ComponentFactory.js';
import { LegalOfficerEndpoint, LogionClientConfig, SharedState } from '@logion/client/dist/SharedClient.js';
import { NetworkState } from '@logion/client/dist/NetworkState.js';
import { UserContext } from '../UserContext';
import { BalanceState } from '@logion/client/dist/Balance.js';
import {
    LocsState,
    PendingRequest,
    ClosedLoc,
    RejectedRequest,
    ClosedCollectionLoc,
    OpenLoc, VoidedCollectionLoc, VoidedLoc
} from "@logion/client";
import { LocType } from "@logion/node-api";

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

export let locsState: Partial<LocsState> | undefined = undefined;

export function setOpenedLocRequests(requests: any[]) {
    locsState = {
        get openLocs(): Record<LocType, OpenLoc[]> {
            return {
                "Transaction": requests,
                "Collection": [],
                "Identity": [],
            }
        }
    }
}

export function setClosedLocRequests(requests: any[]) {
    locsState = {
        get closedLocs(): Record<LocType, (ClosedLoc | ClosedCollectionLoc)[]> {
            return {
                "Transaction": requests,
                "Collection": [],
                "Identity": [],
            }
        }
    }
}

export function setVoidedLocs(requests: any[]) {
    locsState = {
        get voidedLocs(): Record<LocType, (VoidedLoc | VoidedCollectionLoc)[]> {
            return {
                "Transaction": requests,
                "Collection": [],
                "Identity": [],
            }
        }
    }
}

export function setPendingLocRequests(requests: any[]) {
    locsState = {
        get pendingRequests(): Record<LocType, PendingRequest[]> {
            return {
                "Transaction": requests,
                "Collection": [],
                "Identity": [],
            }
        }
    }
}

export function setRejectedLocRequests(requests: any[]) {
    locsState = {
        get rejectedRequests(): Record<LocType, RejectedRequest[]> {
            return {
                "Transaction": requests,
                "Collection": [],
                "Identity": [],
            }
        }
    }
}

export function setDraftLocRequests(requests: any[]) {
    locsState = {
        get draftRequests(): Record<LocType, DraftRequest[]> {
            return {
                "Transaction": requests,
                "Collection": [],
                "Identity": [],
            }
        }
    }
}

export function setOpenVerifiedThirdPartyLocs(transactions: any[], collections: any[]) {
    locsState = {
        get openVerifiedThirdPartyLocs(): Record<LocType, OpenLoc[]> {
            return {
                "Transaction": transactions,
                "Collection": collections,
                "Identity": [],
            }
        }
    }
}
export function setClosedVerifiedThirdPartyLocs(transactions: any[], collections: any[]) {
    locsState = {
        get closedVerifiedThirdPartyLocs(): Record<LocType, ClosedLoc[]> {
            return {
                "Transaction": transactions,
                "Collection": collections,
                "Identity": [],
            }
        }
    }
}


export function setHasValidIdentityLoc(legalOfficers: LegalOfficer []) {
    locsState = {
        legalOfficersWithValidIdentityLoc: legalOfficers
    }
}

export function setLocsState(locsStateMock: LocsState) {
    locsState = locsStateMock;
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
    } as unknown as Partial<UserContext>;
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

export function setMutateLocsState(callback: any) {
    mutateLocsState = callback;
}

export function UserContextProvider() {
    return (
        <div/>
    );
}
