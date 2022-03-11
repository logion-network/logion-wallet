import React, { useContext, useEffect, useCallback, useReducer, Reducer } from "react";

import { useLogionChain } from '../logion-chain';
import { RecoveryConfig, getRecoveryConfig, getProxy } from '../logion-chain/Recovery';
import { Children } from '../common/types/Helpers';
import {
    aggregateArrays,
    AxiosFactory,
    Endpoint,
    MultiResponse,
    MultiSourceHttpClient,
    MultiSourceHttpClientState,
    AnySourceHttpClient
} from '../common/api';

import { ProtectionRequest, Transaction, TransactionsSet } from "../common/types/ModelTypes";
import { fetchProtectionRequests, getTransactions } from "../common/Model";
import {
    CreateProtectionRequest,
    createProtectionRequest as modelCreateProtectionRequest,
} from "./trust-protection/Model";
import { useCommonContext } from '../common/CommonContext';
import { DARK_MODE } from './Types';
import { getVaultAddress } from "../logion-chain/Vault";
import { CoinBalance, getBalances } from "../logion-chain/Balances";

export interface UserContext {
    dataAddress: string | null,
    fetchForAddress: string | null,
    refreshRequests: ((clearBeforeRefresh: boolean) => void) | null,
    createProtectionRequest: ((legalOfficers: string[], requestFactory: (otherLegalOfficerAddress: string) => CreateProtectionRequest) => Promise<void>) | null,
    pendingProtectionRequests: ProtectionRequest[] | null,
    acceptedProtectionRequests: ProtectionRequest[] | null,
    rejectedProtectionRequests: ProtectionRequest[] | null,
    recoveryConfig?: RecoveryConfig | null, // Option.none moved to undefined.
    recoveredAddress?: string | null,
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
        pendingProtectionRequests: null,
        acceptedProtectionRequests: null,
        rejectedProtectionRequests: null,
        recoveryConfig: null,
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
    | 'SET_CURRENT_AXIOS'
;

interface Action {
    type: ActionType,
    dataAddress?: string,
    pendingProtectionRequests?: ProtectionRequest[],
    acceptedProtectionRequests?: ProtectionRequest[],
    rejectedProtectionRequests?: ProtectionRequest[],
    recoveryConfig?: RecoveryConfig,
    vaultAddress?: string,
    vaultBalances?: CoinBalance[],
    vaultTransactions?: Transaction[],
    refreshRequests?: (clearBeforeRefresh: boolean) => void,
    createProtectionRequest?: (legalOfficers: string[], requestFactory: (otherLegalOfficerAddress: string) => CreateProtectionRequest) => Promise<void>,
    clearBeforeRefresh?: boolean,
    recoveredAddress?: string | null,
    axiosFactory?: AxiosFactory,
}

const reducer: Reducer<FullUserContext, Action> = (state: FullUserContext, action: Action): FullUserContext => {
    switch (action.type) {
        case 'FETCH_IN_PROGRESS':
            console.log("fetch in progress for " + action.dataAddress!);
            if(action.clearBeforeRefresh!) {
                return {
                    ...state,
                    fetchForAddress: action.dataAddress!,
                    pendingProtectionRequests: null,
                    acceptedProtectionRequests: null,
                    rejectedProtectionRequests: null,
                    recoveryConfig: null,
                    vaultAddress: null,
                    vaultBalances: null,
                    vaultTransactions: null,
                    recoveredAddress: null,
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
                    pendingProtectionRequests: action.pendingProtectionRequests!,
                    acceptedProtectionRequests: action.acceptedProtectionRequests!,
                    rejectedProtectionRequests: action.rejectedProtectionRequests!,
                    recoveryConfig: action.recoveryConfig!,
                    vaultAddress: action.vaultAddress,
                    vaultBalances: action.vaultBalances!,
                    vaultTransactions: action.vaultTransactions!,
                    recoveredAddress: action.recoveredAddress!,
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
        case "SET_CURRENT_AXIOS":
            return {
                ...state,
                currentAxiosFactory: action.axiosFactory!,
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
    const { accounts, colorTheme, setColorTheme, axiosFactory, isCurrentAuthenticated, nodesUp, nodesDown } = useCommonContext();
    const { api } = useLogionChain();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue());

    useEffect(() => {
        if(colorTheme !== DARK_MODE && setColorTheme !== null) {
            setColorTheme(DARK_MODE);
        }
    }, [ colorTheme, setColorTheme ]);

    const refreshRequests = useCallback((clearBeforeRefresh: boolean) => {
        if(api !== null) {
            const currentAddress = accounts!.current!.address;
            dispatch({
                type: "FETCH_IN_PROGRESS",
                dataAddress: currentAddress,
                clearBeforeRefresh
            });

            (async function () {
                const initialState: MultiSourceHttpClientState<Endpoint> = {
                    nodesUp,
                    nodesDown,
                }
                const token = accounts!.current!.token!.value;
                const multiClient = new MultiSourceHttpClient<Endpoint, ProtectionRequest[]>(initialState, token);
                let result: MultiResponse<ProtectionRequest[]>;

                result = await multiClient.fetch(axios => fetchProtectionRequests(axios, {
                    requesterAddress: currentAddress,
                    statuses: [ "PENDING" ],
                    kind: "ANY",
                }));
                const pendingProtectionRequests = aggregateArrays(result);

                result = await multiClient.fetch(axios => fetchProtectionRequests(axios, {
                    requesterAddress: currentAddress,
                    statuses: [ "ACCEPTED", "ACTIVATED" ],
                    kind: "ANY",
                }));
                const acceptedProtectionRequests = aggregateArrays(result);

                result = await multiClient.fetch(axios => fetchProtectionRequests(axios, {
                    requesterAddress: currentAddress,
                    statuses: [ "REJECTED" ],
                    kind: "ANY",
                }));
                const rejectedProtectionRequests = aggregateArrays(result);

                const recoveryConfig = await getRecoveryConfig({
                    api: api!,
                    accountId: currentAddress
                });

                let recoveredAddress: string | null = null;
                const proxy = await getProxy({
                    api: api!,
                    currentAddress
                });
                if(proxy.isSome) {
                    recoveredAddress = proxy.unwrap().toString();
                }

                let vaultAddress: string | undefined = undefined
                let vaultTransactions: Transaction[] = []
                let vaultBalances: CoinBalance[] = []
                if (recoveryConfig) {
                    vaultAddress = getVaultAddress(currentAddress, recoveryConfig)

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
                    pendingProtectionRequests,
                    acceptedProtectionRequests,
                    rejectedProtectionRequests,
                    recoveryConfig,
                    vaultAddress,
                    vaultBalances,
                    vaultTransactions,
                    recoveredAddress,
                });
            })();
        }
    }, [ api, dispatch, accounts, nodesUp, nodesDown ]);

    useEffect(() => {
        if(api !== null
                && axiosFactory !== undefined
                && accounts !== null
                && accounts.current !== undefined
                && contextValue.dataAddress !== accounts.current.address
                && contextValue.fetchForAddress !== accounts.current.address
                && isCurrentAuthenticated()
                && nodesUp.length > 0) {
            refreshRequests(true);
        }
    }, [ api, axiosFactory, contextValue, accounts, refreshRequests, dispatch, isCurrentAuthenticated, nodesUp ]);

    useEffect(() => {
        if(contextValue.refreshRequests !== refreshRequests && api !== null) {
            dispatch({
                type: "SET_REFRESH_REQUESTS_FUNCTION",
                refreshRequests,
            });
        }
    }, [ api, refreshRequests, contextValue, dispatch ]);

    useEffect(() => {
        if (axiosFactory !== undefined
                && api !== null
                && (contextValue.createProtectionRequest === null || axiosFactory !== contextValue.currentAxiosFactory)) {
            const createProtectionRequest = async (legalOfficers: string[], requestFactory: (otherLegalOfficerAddress: string) => CreateProtectionRequest): Promise<void> => {
                const promises = [
                    modelCreateProtectionRequest(axiosFactory(legalOfficers[0])!, requestFactory(legalOfficers[1])),
                    modelCreateProtectionRequest(axiosFactory(legalOfficers[1])!, requestFactory(legalOfficers[0]))
                ]
                await Promise.all(promises);
            }
            dispatch({
                type: "SET_CREATE_PROTECTION_REQUEST_FUNCTION",
                createProtectionRequest,
            });
        }
    }, [ axiosFactory, api, contextValue, refreshRequests, dispatch ]);

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
