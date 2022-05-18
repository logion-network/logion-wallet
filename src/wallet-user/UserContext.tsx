import React, { useContext, useEffect, useCallback, useReducer, Reducer } from "react";
import { getVaultAddress } from "@logion/node-api/dist/Vault";
import { CoinBalance, getBalances } from "@logion/node-api/dist/Balances";
import { DateTime } from "luxon";
import { ActiveProtection, ClaimedRecovery, LegalOfficer, NoProtection, PendingProtection, PostalAddress, ProtectionState, UserIdentity, SignCallback, AcceptedProtection, PendingRecovery } from "@logion/client";

import { useLogionChain } from '../logion-chain';
import { Children } from '../common/types/Helpers';
import {
    AxiosFactory,
    Endpoint,
    MultiSourceHttpClientState,
    AnySourceHttpClient
} from '../common/api';

import { Transaction, TransactionsSet } from "../common/types/ModelTypes";
import { getTransactions } from "../common/Model";
import { useCommonContext } from '../common/CommonContext';
import { DARK_MODE } from './Types';

export interface CreateProtectionRequestParams {
    legalOfficers: LegalOfficer[],
    postalAddress: PostalAddress,
    userIdentity: UserIdentity,
    addressToRecover?: string,
    callback?: SignCallback,
};

export interface UserContext {
    dataAddress: string | null,
    fetchForAddress: string | null,
    refreshRequests: ((clearBeforeRefresh: boolean) => void) | null,
    createProtectionRequest: ((params: CreateProtectionRequestParams) => Promise<void>) | null,
    activateProtection: ((callback: SignCallback) => Promise<void>) | null,
    claimRecovery: ((callback: SignCallback) => Promise<void>) | null,
    protectionState?: ProtectionState,
    vaultAddress?: string | null,
    vaultBalances: CoinBalance[] | null,
    vaultTransactions: Transaction[] | null,
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
        activateProtection: null,
        claimRecovery: null,
        vaultAddress: null,
        vaultBalances: null,
        vaultTransactions: null,
    }
}

const UserContextObject: React.Context<FullUserContext> = React.createContext(initialContextValue());

type ActionType = 'FETCH_IN_PROGRESS'
    | 'SET_DATA'
    | 'SET_REFRESH_REQUESTS_FUNCTION'
    | 'SET_CREATE_PROTECTION_REQUEST_FUNCTION'
    | 'SET_ACTIVATE_PROTECTION_FUNCTION'
    | 'SET_CLAIM_RECOVERY_FUNCTION'
    | 'SET_CURRENT_AXIOS'
    | 'REFRESH_PROTECTION_STATE'
;

interface Action {
    type: ActionType,
    dataAddress?: string,
    protectionState?: ProtectionState,
    vaultAddress?: string,
    vaultBalances?: CoinBalance[],
    vaultTransactions?: Transaction[],
    refreshRequests?: (clearBeforeRefresh: boolean) => void,
    createProtectionRequest?: (params: CreateProtectionRequestParams) => Promise<void>,
    activateProtection?: (callback: SignCallback) => Promise<void>,
    claimRecovery?: (callback: SignCallback) => Promise<void>,
    clearBeforeRefresh?: boolean,
    axiosFactory?: AxiosFactory,
}

const reducer: Reducer<FullUserContext, Action> = (state: FullUserContext, action: Action): FullUserContext => {
    switch (action.type) {
        case 'FETCH_IN_PROGRESS':
            if(action.clearBeforeRefresh!) {
                return {
                    ...state,
                    fetchForAddress: action.dataAddress!,
                    protectionState: undefined,
                    vaultAddress: null,
                    vaultBalances: null,
                    vaultTransactions: null,
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
                    vaultAddress: action.vaultAddress,
                    vaultBalances: action.vaultBalances!,
                    vaultTransactions: action.vaultTransactions!,
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
            return {
                ...state,
                protectionState: action.protectionState!,
            };
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
    const { colorTheme, setColorTheme, nodesUp, nodesDown } = useCommonContext();
    const { api } = useLogionChain();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue());

    useEffect(() => {
        if(colorTheme !== DARK_MODE && setColorTheme !== null) {
            setColorTheme(DARK_MODE);
        }
    }, [ colorTheme, setColorTheme ]);

    const refreshRequests = useCallback((clearBeforeRefresh: boolean) => {
        if(api !== null && client !== null) {
            const currentAddress = accounts!.current!.address;
            const forceProtectionStateFetch = currentAddress !== contextValue.dataAddress;
            dispatch({
                type: "FETCH_IN_PROGRESS",
                dataAddress: currentAddress,
                clearBeforeRefresh
            });

            (async function () {
                let protectionState = contextValue.protectionState;
                if(protectionState === undefined || forceProtectionStateFetch) {
                    protectionState = await client.protectionState();
                } else if(contextValue.protectionState instanceof PendingProtection) {
                    protectionState = await contextValue.protectionState.refresh();
                }

                const initialState: MultiSourceHttpClientState<Endpoint> = {
                    nodesUp,
                    nodesDown,
                }
                const token = accounts!.current!.token!.value;

                let vaultAddress: string | undefined = undefined
                let vaultTransactions: Transaction[] = []
                let vaultBalances: CoinBalance[] = []
                if (contextValue.protectionState instanceof ActiveProtection
                        || contextValue.protectionState instanceof ClaimedRecovery) {
                    const activeOrClaimed = contextValue.protectionState;
                    const legalOfficers = activeOrClaimed.protectionParameters.states.map(state => state.legalOfficer.address);
                    vaultAddress = getVaultAddress(currentAddress, legalOfficers);

                    const anyClient = new AnySourceHttpClient<Endpoint, TransactionsSet>(initialState, token);
                    const transactionsSet = await anyClient.fetch(axios => getTransactions(axios, {
                        address: vaultAddress!
                    }));
                    vaultTransactions = transactionsSet?.transactions || [];

                    vaultBalances = await getBalances({
                        api: api!,
                        accountId: vaultAddress
                    });
                }

                dispatch({
                    type: "SET_DATA",
                    dataAddress: currentAddress,
                    protectionState,
                    vaultAddress,
                    vaultBalances,
                    vaultTransactions,
                });
            })();
        }
    }, [ api, dispatch, accounts, nodesUp, nodesDown, client, contextValue.protectionState, contextValue.dataAddress ]);

    useEffect(() => {
        if(api !== null
                && client !== undefined
                && client!.isTokenValid(DateTime.now())
                && accounts !== null
                && accounts.current !== undefined
                && contextValue.dataAddress !== accounts.current.address
                && contextValue.fetchForAddress !== accounts.current.address
                && nodesUp.length > 0) {
            refreshRequests(true);
        }
    }, [ api, client, contextValue, accounts, refreshRequests, dispatch, nodesUp ]);

    useEffect(() => {
        if(contextValue.refreshRequests !== refreshRequests && api !== null) {
            dispatch({
                type: "SET_REFRESH_REQUESTS_FUNCTION",
                refreshRequests,
            });
        }
    }, [ api, refreshRequests, contextValue, dispatch ]);

    const createProtectionRequestCallback = useCallback(async (params: CreateProtectionRequestParams) => {
        const protectionState = contextValue.protectionState;
        if(protectionState instanceof NoProtection) {
            let pending: ProtectionState;
            if(params.addressToRecover !== undefined) {
                pending = await protectionState.requestRecovery({
                    legalOfficer1: params.legalOfficers[0],
                    legalOfficer2: params.legalOfficers[1],
                    postalAddress: params.postalAddress,
                    userIdentity: params.userIdentity,
                    recoveredAddress: params.addressToRecover,
                    callback: params.callback,
                    signer: signer!,
                });
            } else {
                pending = await protectionState.requestProtection({
                    legalOfficer1: params.legalOfficers[0],
                    legalOfficer2: params.legalOfficers[1],
                    postalAddress: params.postalAddress,
                    userIdentity: params.userIdentity,
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

    const activateProtectionCallback = useCallback(async (callback: SignCallback) => {
        const acceptedProtection = contextValue.protectionState as AcceptedProtection;
        const protectionState = await acceptedProtection.activate(signer!, callback);
        dispatch({
            type: "REFRESH_PROTECTION_STATE",
            protectionState
        });
    }, [ contextValue.protectionState, signer ]);

    useEffect(() => {
        if(contextValue.activateProtection !== activateProtectionCallback) {
            dispatch({
                type: "SET_ACTIVATE_PROTECTION_FUNCTION",
                activateProtection: activateProtectionCallback
            });
        }
    }, [ contextValue, activateProtectionCallback ]);

    const claimRecoveryCallback = useCallback(async (callback: SignCallback) => {
        const pendingRecovery = contextValue.protectionState as PendingRecovery;
        const protectionState = await pendingRecovery.claimRecovery(signer!, callback);
        dispatch({
            type: "REFRESH_PROTECTION_STATE",
            protectionState
        });
    }, [ contextValue.protectionState, signer ]);

    useEffect(() => {
        if(contextValue.claimRecovery !== claimRecoveryCallback) {
            dispatch({
                type: "SET_CLAIM_RECOVERY_FUNCTION",
                claimRecovery: claimRecoveryCallback
            });
        }
    }, [ contextValue, claimRecoveryCallback ]);

    useEffect(() => {
        if(axiosFactory !== undefined
                && contextValue.currentAxiosFactory !== axiosFactory) {
            dispatch({
                type: "SET_CURRENT_AXIOS",
                axiosFactory,
            });
        }
    }, [ axiosFactory, contextValue, dispatch ]);

    return (
        <UserContextObject.Provider value={contextValue}>
            {props.children}
        </UserContextObject.Provider>
    );
}

export function useUserContext(): UserContext {
    return useContext(UserContextObject);
}
