import React, { useContext, useEffect, useCallback, useReducer, Reducer } from "react";
import { DateTime } from "luxon";
import {
    ActiveProtection,
    ClaimedRecovery,
    LegalOfficer,
    LegalOfficerClass,
    NoProtection,
    ProtectionState,
    SignCallback,
    RejectedRecovery,
    BalanceState,
    LocsState,
    VaultState,
    ActiveRecovery,
    AcceptedRecovery,
} from "@logion/client";

import { useLogionChain, AxiosFactory } from '../logion-chain';
import { Children } from '../common/types/Helpers';

import { useCommonContext } from '../common/CommonContext';
import { DARK_MODE } from './Types';
import { UUID, LocType, ValidAccountId, Fees as FeesClass, Fees } from "@logion/node-api";
import { Locs, getLocsMap } from "src/loc/Locs";

export interface ProtectionRequestParams {
    legalOfficers: LegalOfficerClass[],
    addressToRecover?: ValidAccountId,
    requesterIdentityLoc1: UUID,
    requesterIdentityLoc2: UUID,
}

export interface CreateProtectionRequestParams extends ProtectionRequestParams {
    callback: SignCallback,
}

export interface UserContext {
    dataAddress: string | null,
    fetchForAddress: string | null,
    refreshRequests: ((clearBeforeRefresh: boolean) => void) | null,
    createProtectionRequest: ((params: CreateProtectionRequestParams) => Promise<void>) | null,
    estimateFeesCreateProtectionRequest: ((params: ProtectionRequestParams) => Promise<FeesClass>) | null,
    activateProtection: ((callback: SignCallback) => Promise<void>) | null,
    claimRecovery: ((callback: SignCallback) => Promise<void>) | null,
    cancelProtection: () => Promise<void>,
    protectionState?: ProtectionState,
    vaultState?: VaultState,
    mutateVaultState: (mutator: (current: VaultState) => Promise<VaultState>) => Promise<void>,
    recoveredVaultState?: VaultState,
    mutateRecoveredVaultState: (mutator: (current: VaultState) => Promise<VaultState>) => Promise<void>,
    recoveredBalanceState?: BalanceState,
    mutateRecoveredBalanceState: (mutator: (current: BalanceState) => Promise<BalanceState>) => Promise<void>,
    locsState?: LocsState,
    mutateLocsState: (mutator: (current: LocsState) => Promise<LocsState>) => Promise<void>,
    locs: Record<LocType, Locs>,
}

interface FullUserContext extends UserContext {
    currentAxiosFactory?: AxiosFactory;
}

function initialContextValue(): FullUserContext {
    return {
        dataAddress: null,
        fetchForAddress: null,
        refreshRequests: null,
        createProtectionRequest: null,
        estimateFeesCreateProtectionRequest: null,
        activateProtection: null,
        claimRecovery: null,
        cancelProtection: () => Promise.reject(),
        mutateVaultState: () => Promise.reject(),
        mutateRecoveredVaultState: () => Promise.reject(),
        mutateRecoveredBalanceState: () => Promise.reject(),
        mutateLocsState: () => Promise.reject(),
        locs: {
            Identity: Locs.empty("User"),
            Transaction: Locs.empty("User"),
            Collection: Locs.empty("User"),
        }
    }
}

const UserContextObject: React.Context<FullUserContext> = React.createContext(initialContextValue());

type ActionType = 'FETCH_IN_PROGRESS'
    | 'SET_DATA'
    | 'SET_REFRESH_REQUESTS_FUNCTION'
    | 'SET_CREATE_PROTECTION_REQUEST_FUNCTION'
    | 'SET_ESTIMATE_FEES_CREATE_PROTECTION_REQUEST_FUNCTION'
    | 'SET_ACTIVATE_PROTECTION_FUNCTION'
    | 'SET_CLAIM_RECOVERY_FUNCTION'
    | 'SET_CURRENT_AXIOS'
    | 'REFRESH_PROTECTION_STATE'
    | 'SET_MUTATE_VAULT_STATE'
    | 'MUTATE_VAULT_STATE'
    | 'SET_MUTATE_RECOVERED_VAULT_STATE'
    | 'MUTATE_RECOVERED_VAULT_STATE'
    | 'SET_MUTATE_RECOVERED_BALANCE_STATE'
    | 'MUTATE_RECOVERED_BALANCE_STATE'
    | 'SET_MUTATE_LOCS_STATE'
    | 'MUTATE_LOCS_STATE'
    | 'SET_PROTECTION_CANCEL'
    | 'SET_PROTECTION_CHANGE_LO'
    ;

interface Action {
    type: ActionType,
    dataAddress?: string,
    protectionState?: ProtectionState,
    refreshRequests?: (clearBeforeRefresh: boolean) => void,
    createProtectionRequest?: (params: CreateProtectionRequestParams) => Promise<void>,
    estimateFeesCreateProtectionRequest?: (params: ProtectionRequestParams) => Promise<FeesClass>,
    activateProtection?: (callback: SignCallback) => Promise<void>,
    claimRecovery?: (callback: SignCallback) => Promise<void>,
    cancelProtection?: () => Promise<void>,
    resubmitProtection?: (legalOfficer: LegalOfficer) => Promise<void>,
    changeProtectionLegalOfficer?: (legalOfficer: LegalOfficer, newLegalOfficer: LegalOfficer, newIdentityLoc: UUID) => Promise<void>,
    clearBeforeRefresh?: boolean,
    axiosFactory?: AxiosFactory,
    vaultState?: VaultState,
    mutateVaultState?: (mutator: (current: VaultState) => Promise<VaultState>) => Promise<void>,
    recoveredVaultState?: VaultState,
    mutateRecoveredVaultState?: (mutator: (current: VaultState) => Promise<VaultState>) => Promise<void>,
    recoveredBalanceState?: BalanceState,
    mutateRecoveredBalanceState?: (mutator: (current: BalanceState) => Promise<BalanceState>) => Promise<void>,
    locsState?: LocsState,
    locs?: Record<LocType, Locs>,
    mutateLocsState?: (mutator: (current: LocsState) => Promise<LocsState>) => Promise<void>,
}

const reducer: Reducer<FullUserContext, Action> = (state: FullUserContext, action: Action): FullUserContext => {
    switch (action.type) {
        case 'FETCH_IN_PROGRESS':
            if(action.clearBeforeRefresh!) {
                return {
                    ...state,
                    fetchForAddress: action.dataAddress!,
                    protectionState: undefined,
                    vaultState: undefined,
                    recoveredVaultState: undefined,
                    recoveredBalanceState: undefined,
                    locsState: undefined,
                };
            } else {
                return {
                    ...state,
                    fetchForAddress: action.dataAddress!,
                };
            }
        case 'SET_DATA':
            if(action.dataAddress === state.fetchForAddress) {
                console.log("setting data for " + state.fetchForAddress);
                return {
                    ...state,
                    fetchForAddress: null,
                    dataAddress: action.dataAddress!,
                    protectionState: action.protectionState!,
                    vaultState: action.vaultState,
                    recoveredVaultState: action.recoveredVaultState,
                    recoveredBalanceState: action.recoveredBalanceState,
                    locsState: action.locsState,
                    locs: action.locs!,
                };
            } else {
                console.log(`Skipping data because ${action.dataAddress} <> ${state.fetchForAddress}`);
                return state;
            }
        case "SET_REFRESH_REQUESTS_FUNCTION":
            return {
                ...state,
                refreshRequests: action.refreshRequests!,
            };
        case "SET_CREATE_PROTECTION_REQUEST_FUNCTION":
            return {
                ...state,
                createProtectionRequest: action.createProtectionRequest!,
            };
        case "SET_ESTIMATE_FEES_CREATE_PROTECTION_REQUEST_FUNCTION":
            return {
                ...state,
                estimateFeesCreateProtectionRequest: action.estimateFeesCreateProtectionRequest!,
            };
        case "SET_ACTIVATE_PROTECTION_FUNCTION":
            return {
                ...state,
                activateProtection: action.activateProtection!,
            };
        case "SET_CLAIM_RECOVERY_FUNCTION":
            return {
                ...state,
                claimRecovery: action.claimRecovery!,
            };
        case "SET_CURRENT_AXIOS":
            return {
                ...state,
                currentAxiosFactory: action.axiosFactory!,
            };
        case "REFRESH_PROTECTION_STATE":
            const vaultState = action.vaultState ? action.vaultState : state.vaultState;
            const recoveredVaultState = action.recoveredVaultState ? action.recoveredVaultState : state.recoveredVaultState;
            const recoveredBalanceState = action.recoveredBalanceState ? action.recoveredBalanceState : state.recoveredBalanceState;
            return {
                ...state,
                protectionState: action.protectionState!,
                vaultState,
                recoveredVaultState,
                recoveredBalanceState,
            };
        case "SET_MUTATE_VAULT_STATE":
            return {
                ...state,
                mutateVaultState: action.mutateVaultState!,
            };
        case "MUTATE_VAULT_STATE":
            return {
                ...state,
                vaultState: action.vaultState!,
            };
        case "SET_MUTATE_RECOVERED_VAULT_STATE":
            return {
                ...state,
                mutateRecoveredVaultState: action.mutateRecoveredVaultState!,
            };
        case "MUTATE_RECOVERED_VAULT_STATE":
            return {
                ...state,
                recoveredVaultState: action.recoveredVaultState!,
            };
        case "SET_MUTATE_RECOVERED_BALANCE_STATE":
            return {
                ...state,
                mutateRecoveredBalanceState: action.mutateRecoveredBalanceState!,
            };
        case "MUTATE_RECOVERED_BALANCE_STATE":
            return {
                ...state,
                recoveredBalanceState: action.recoveredBalanceState!,
            };
        case "SET_MUTATE_LOCS_STATE":
            return {
                ...state,
                mutateLocsState: action.mutateLocsState!,
            };
        case "MUTATE_LOCS_STATE":
            return {
                ...state,
                locsState: action.locsState!,
                locs: action.locs!,
            };
        case "SET_PROTECTION_CANCEL":
            return {
                ...state,
                cancelProtection: action.cancelProtection!,
            }
        default:
            /* istanbul ignore next */
            throw new Error(`Unknown type: ${action.type}`);
    }
}

export interface Props {
    children: Children
}

export function UserContextProvider(props: Props) {
    const { accounts, client, axiosFactory, signer } = useLogionChain();
    const { colorTheme, setColorTheme, nodesUp, viewer, setViewer } = useCommonContext();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue());

    useEffect(() => {
        if(colorTheme !== DARK_MODE && setColorTheme !== null) {
            setColorTheme(DARK_MODE);
        }
    }, [ colorTheme, setColorTheme ]);

    useEffect(() => {
        if(viewer !== "User" && setViewer) {
            setViewer("User");
        }
    }, [ viewer, setViewer ]);

    const refreshRequests = useCallback((clearBeforeRefresh: boolean) => {
        if(client !== null) {
            const currentAddress = accounts!.current!.accountId;
            dispatch({
                type: "FETCH_IN_PROGRESS",
                dataAddress: currentAddress.toKey(),
                clearBeforeRefresh
            });

            (async function () {
                let protectionState = contextValue.protectionState;
                let vaultState: VaultState | undefined;
                let recoveredVaultState: VaultState | undefined;
                let recoveredBalanceState: BalanceState | undefined;
                if(currentAddress.type === "Polkadot") {
                    protectionState = await client.protectionState();

                    if (protectionState instanceof ActiveProtection
                            || protectionState instanceof ActiveRecovery
                            || protectionState instanceof ClaimedRecovery) {
                        vaultState = await protectionState.vaultState();
                    }

                    if(protectionState instanceof ClaimedRecovery) {
                        recoveredVaultState = await protectionState.recoveredVaultState();
                        recoveredBalanceState = await protectionState.recoveredBalanceState();
                    }
                }

                const locsState = await client.locsState();
                const locs = getLocsMap(locsState, "User");
                dispatch({
                    type: "SET_DATA",
                    dataAddress: currentAddress.toKey(),
                    protectionState,
                    vaultState,
                    recoveredVaultState,
                    recoveredBalanceState,
                    locsState,
                    locs,
                });
            })();
        }
    }, [ dispatch, accounts, client, contextValue.protectionState ]);

    useEffect(() => {
        if(client !== undefined
                && client!.isTokenValid(DateTime.now())
                && accounts !== null
                && accounts.current !== undefined
                && contextValue.dataAddress !== accounts.current.accountId.toKey()
                && contextValue.fetchForAddress !== accounts.current.accountId.toKey()
                && nodesUp.length > 0) {
            refreshRequests(true);
        }
    }, [ client, contextValue, accounts, refreshRequests, dispatch, nodesUp ]);

    useEffect(() => {
        if(contextValue.refreshRequests !== refreshRequests) {
            dispatch({
                type: "SET_REFRESH_REQUESTS_FUNCTION",
                refreshRequests,
            });
        }
    }, [ refreshRequests, contextValue, dispatch ]);

    const createProtectionRequestCallback = useCallback(async (params: CreateProtectionRequestParams) => {
        const protectionState = contextValue.protectionState;
        if(protectionState instanceof NoProtection) {
            let pending: ProtectionState;
            if(params.addressToRecover !== undefined) {
                pending = await protectionState.requestRecovery({
                    payload: {
                        legalOfficer1: params.legalOfficers[0],
                        legalOfficer2: params.legalOfficers[1],
                        recoveredAccount: params.addressToRecover,
                        requesterIdentityLoc1: params.requesterIdentityLoc1,
                        requesterIdentityLoc2: params.requesterIdentityLoc2,
                    },
                    callback: params.callback,
                    signer: signer!,
                });
            } else {
                pending = await protectionState.activateProtection({
                    payload: {
                        legalOfficer1: params.legalOfficers[0],
                        legalOfficer2: params.legalOfficers[1],
                        requesterIdentityLoc1: params.requesterIdentityLoc1,
                        requesterIdentityLoc2: params.requesterIdentityLoc2,
                    },
                    callback: params.callback,
                    signer: signer!,
                });
            }
            dispatch({
                type: "REFRESH_PROTECTION_STATE",
                protectionState: pending,
            });
        }
    }, [ contextValue.protectionState, dispatch, signer ]);

    useEffect(() => {
        if(contextValue.createProtectionRequest !== createProtectionRequestCallback) {
            dispatch({
                type: "SET_CREATE_PROTECTION_REQUEST_FUNCTION",
                createProtectionRequest: createProtectionRequestCallback,
            });
        }
    }, [ contextValue, dispatch, createProtectionRequestCallback ]);

    const estimateFeesCreateProtectionRequestCallback = useCallback(async (params: ProtectionRequestParams) => {
        const protectionState = contextValue.protectionState;
        if(protectionState instanceof NoProtection) {
            if(params.addressToRecover !== undefined) {
                return await protectionState.estimateFeesRequestRecovery({
                    legalOfficer1: params.legalOfficers[0],
                    legalOfficer2: params.legalOfficers[1],
                    recoveredAccount: params.addressToRecover,
                    requesterIdentityLoc1: params.requesterIdentityLoc1,
                    requesterIdentityLoc2: params.requesterIdentityLoc2,
                });
            } else {
                return await protectionState.estimateFeesActivateProtection({
                    legalOfficer1: params.legalOfficers[0],
                    legalOfficer2: params.legalOfficers[1],
                    requesterIdentityLoc1: params.requesterIdentityLoc1,
                    requesterIdentityLoc2: params.requesterIdentityLoc2,
                });
            }
        } else {
            return Fees.zero()
        }
    }, [ contextValue.protectionState ]);

    useEffect(() => {
        if(contextValue.estimateFeesCreateProtectionRequest !== estimateFeesCreateProtectionRequestCallback) {
            dispatch({
                type: "SET_ESTIMATE_FEES_CREATE_PROTECTION_REQUEST_FUNCTION",
                estimateFeesCreateProtectionRequest: estimateFeesCreateProtectionRequestCallback,
            });
        }
    }, [ contextValue, dispatch, estimateFeesCreateProtectionRequestCallback ]);


    const activateProtectionCallback = useCallback(async (callback: SignCallback) => {
        const acceptedProtection = contextValue.protectionState as AcceptedRecovery;
        const protectionState = await acceptedProtection.activate({ signer: signer!, callback });
        const vaultState = await protectionState.vaultState();
        dispatch({
            type: "REFRESH_PROTECTION_STATE",
            protectionState,
            vaultState,
        });
    }, [ contextValue.protectionState, signer ]);

    useEffect(() => {
        if (contextValue.activateProtection !== activateProtectionCallback) {
            dispatch({
                type: "SET_ACTIVATE_PROTECTION_FUNCTION",
                activateProtection: activateProtectionCallback
            });
        }
    }, [ contextValue, activateProtectionCallback ]);

    const claimRecoveryCallback = useCallback(async (callback: SignCallback) => {
        const pendingRecovery = contextValue.protectionState as ActiveRecovery;
        const protectionState = await pendingRecovery.claimRecovery({ signer: signer!, callback });
        const recoveredBalanceState = await protectionState.recoveredBalanceState();
        const recoveredVaultState = await protectionState.recoveredVaultState();
        dispatch({
            type: "REFRESH_PROTECTION_STATE",
            protectionState,
            recoveredBalanceState,
            recoveredVaultState,
        });
    }, [ contextValue.protectionState, signer ]);

    useEffect(() => {
        if (contextValue.claimRecovery !== claimRecoveryCallback) {
            dispatch({
                type: "SET_CLAIM_RECOVERY_FUNCTION",
                claimRecovery: claimRecoveryCallback
            });
        }
    }, [ contextValue, claimRecoveryCallback ]);

    useEffect(() => {
        if (axiosFactory !== undefined
            && contextValue.currentAxiosFactory !== axiosFactory) {
            dispatch({
                type: "SET_CURRENT_AXIOS",
                axiosFactory,
            });
        }
    }, [ axiosFactory, contextValue, dispatch ]);

    const mutateVaultStateCallback = useCallback(async (mutator: (current: VaultState) => Promise<VaultState>): Promise<void> => {
        const newState = await mutator(contextValue.vaultState!);
        dispatch({
            type: "MUTATE_VAULT_STATE",
            vaultState: newState,
        });
    }, [ contextValue.vaultState ]);

    useEffect(() => {
        if (contextValue.mutateVaultState !== mutateVaultStateCallback) {
            dispatch({
                type: "SET_MUTATE_VAULT_STATE",
                mutateVaultState: mutateVaultStateCallback,
            });
        }
    }, [ contextValue.mutateVaultState, mutateVaultStateCallback ]);

    const mutateRecoveredVaultStateCallback = useCallback(async (mutator: (current: VaultState) => Promise<VaultState>): Promise<void> => {
        const newState = await mutator(contextValue.recoveredVaultState!);
        dispatch({
            type: "MUTATE_RECOVERED_VAULT_STATE",
            recoveredVaultState: newState,
        });
    }, [ contextValue.recoveredVaultState ]);

    useEffect(() => {
        if (contextValue.mutateRecoveredVaultState !== mutateRecoveredVaultStateCallback) {
            dispatch({
                type: "SET_MUTATE_RECOVERED_VAULT_STATE",
                mutateRecoveredVaultState: mutateRecoveredVaultStateCallback,
            });
        }
    }, [ mutateRecoveredVaultStateCallback, contextValue.mutateRecoveredVaultState ]);

    const mutateRecoveredBalanceStateCallback = useCallback(async (mutator: (current: BalanceState) => Promise<BalanceState>): Promise<void> => {
        const newState = await mutator(contextValue.recoveredBalanceState!);
        dispatch({
            type: "MUTATE_RECOVERED_BALANCE_STATE",
            recoveredBalanceState: newState,
        });
    }, [ contextValue.recoveredBalanceState ]);

    useEffect(() => {
        if (contextValue.mutateRecoveredBalanceState !== mutateRecoveredBalanceStateCallback) {
            dispatch({
                type: "SET_MUTATE_RECOVERED_BALANCE_STATE",
                mutateRecoveredBalanceState: mutateRecoveredBalanceStateCallback,
            });
        }
    }, [ mutateRecoveredBalanceStateCallback, contextValue.mutateRecoveredBalanceState ]);

    const mutateLocsStateCallback = useCallback(async (mutator: (current: LocsState) => Promise<LocsState>): Promise<void> => {
        const newState = await mutator(contextValue.locsState!);
        if(newState !== contextValue.locsState) {
            const locs = getLocsMap(newState, "User");
            dispatch({
                type: "MUTATE_LOCS_STATE",
                locsState: newState,
                locs,
            });
        }
    }, [ contextValue.locsState ]);

    useEffect(() => {
        if (contextValue.mutateLocsState !== mutateLocsStateCallback) {
            dispatch({
                type: "SET_MUTATE_LOCS_STATE",
                mutateLocsState: mutateLocsStateCallback,
            });
        }
    }, [ mutateLocsStateCallback, contextValue.mutateLocsState ]);

    const cancelProtectionCallback = useCallback(async () => {
        const rejectedProtection = contextValue.protectionState as RejectedRecovery;
        const noProtection = await rejectedProtection.cancel();
        dispatch({
            type: "REFRESH_PROTECTION_STATE",
            protectionState: noProtection
        })
    }, [ contextValue.protectionState ])

    useEffect(() => {
        if (contextValue.cancelProtection !== cancelProtectionCallback) {
            dispatch({
                type: "SET_PROTECTION_CANCEL",
                cancelProtection: cancelProtectionCallback,
            });
        }
    }, [ contextValue.cancelProtection, cancelProtectionCallback]);

    return (
        <UserContextObject.Provider value={ contextValue }>
            { props.children }
        </UserContextObject.Provider>
    );
}

export function useUserContext(): UserContext {
    return useContext(UserContextObject);
}
