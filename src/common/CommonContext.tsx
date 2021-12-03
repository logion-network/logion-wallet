import React, { useContext, useEffect, useReducer, Reducer, useCallback } from "react";
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { AxiosInstance } from 'axios';
import moment from 'moment';

import { useLogionChain } from '../logion-chain';
import { CoinBalance, getBalances } from '../logion-chain/Balances';

import { AxiosFactory, buildAxiosFactory, fetchFromAvailableNodes, anyNodeAxios } from './api';
import Accounts, { buildAccounts, AccountTokens, Account } from './types/Accounts';
import { Children } from './types/Helpers';
import { Transaction, LocRequest } from './types/ModelTypes';
import { getTransactions, FetchLocRequestSpecification, fetchLocRequests } from "./Model";
import { ColorTheme, DEFAULT_COLOR_THEME } from "./ColorTheme";
import { storeTokens, clearTokens, loadTokens, storeCurrentAddress, loadCurrentAddress, clearCurrentAddress } from './Storage';
import { LegalOfficerCase } from "../logion-chain/Types";
import { toDecimalString, UUID } from "../logion-chain/UUID";
import { getLegalOfficerCasesMap } from "../logion-chain/LogionLoc";

const DEFAULT_NOOP = () => {};

export interface RequestAndLoc {
    request: LocRequest;
    loc?: LegalOfficerCase;
}

export interface CommonContext {
    selectAddress: ((address: string) => void) | null;
    accounts: Accounts | null;
    fetchForAddress: string | null;
    dataAddress: string | null;
    balances: CoinBalance[] | null;
    transactions: Transaction[] | null;
    pendingLocRequests: LocRequest[] | null;
    rejectedLocRequests: LocRequest[] | null;
    openedLocRequests: RequestAndLoc[] | null;
    closedLocRequests: RequestAndLoc[] | null;
    openedIdentityLocs: RequestAndLoc[] | null;
    closedIdentityLocs: RequestAndLoc[] | null;
    colorTheme: ColorTheme;
    setColorTheme: ((colorTheme: ColorTheme) => void) | null;
    setTokens: (tokens: AccountTokens) => void;
    logout: () => void;
    axiosFactory?: AxiosFactory;
    refresh: (clearOnRefresh?: boolean) => void;
    voidTransactionLocs: RequestAndLoc[] | null;
    voidIdentityLocs: RequestAndLoc[] | null;
}

interface FullCommonContext extends CommonContext {
    injectedAccounts: InjectedAccountWithMeta[] | null;
    tokens: AccountTokens;
    timer?: number;
    refreshAddress?: string;
}

function initialContextValue(): FullCommonContext {
    const tokens = loadTokens().refresh(moment());
    return {
        selectAddress: null,
        accounts: null,
        injectedAccounts: null,
        fetchForAddress: null,
        dataAddress: null,
        balances: null,
        transactions: null,
        pendingLocRequests: null,
        rejectedLocRequests: null,
        openedLocRequests: null,
        closedLocRequests: null,
        openedIdentityLocs: null,
        closedIdentityLocs: null,
        colorTheme: DEFAULT_COLOR_THEME,
        setColorTheme: null,
        tokens,
        setTokens: DEFAULT_NOOP,
        logout: DEFAULT_NOOP,
        refresh: DEFAULT_NOOP,
        voidTransactionLocs: null,
        voidIdentityLocs: null,
    }
}

const CommonContextObject: React.Context<FullCommonContext> = React.createContext(initialContextValue());

export interface Props {
    children: Children
}

type ActionType = 'SET_SELECT_ADDRESS'
    | 'SELECT_ADDRESS'
    | 'SET_ADDRESSES'
    | 'FETCH_IN_PROGRESS'
    | 'SET_DATA'
    | 'SET_COLOR_THEME'
    | 'SET_SET_COLOR_THEME'
    | 'SET_SET_TOKEN'
    | 'SET_TOKENS'
    | 'SET_LOGOUT'
    | 'LOGOUT'
    | 'SCHEDULE_TOKEN_REFRESH'
    | 'REFRESH_TOKENS'
    | 'SET_REFRESH';

interface Action {
    type: ActionType,
    selectAddress?: ((address: string) => void),
    newAddress?: string,
    accounts?: Accounts,
    injectedAccounts?: InjectedAccountWithMeta[],
    dataAddress?: string,
    balances?: CoinBalance[],
    transactions?: Transaction[],
    newColorTheme?: ColorTheme,
    setColorTheme?: ((colorTheme: ColorTheme) => void),
    setTokens?: (tokens: AccountTokens) => void,
    newTokens?: AccountTokens,
    logout?: () => void,
    timer?: number;
    pendingLocRequests?: LocRequest[];
    openedLocRequests?: RequestAndLoc[];
    closedLocRequests?: RequestAndLoc[];
    rejectedLocRequests?: LocRequest[];
    openedIdentityLocs?: RequestAndLoc[];
    closedIdentityLocs?: RequestAndLoc[];
    refresh?: (clearOnRefresh?: boolean) => void;
    refreshAddress?: string;
    clearOnRefresh?: boolean;
    voidTransactionLocs?: RequestAndLoc[];
    voidIdentityLocs?: RequestAndLoc[];
}

const reducer: Reducer<FullCommonContext, Action> = (state: FullCommonContext, action: Action): FullCommonContext => {
    switch (action.type) {
        case 'SET_SELECT_ADDRESS':
            return {
                ...state,
                selectAddress: action.selectAddress!
            };
        case 'SELECT_ADDRESS': {
            const accounts = buildAccounts(state.injectedAccounts!, action.newAddress!, state.tokens);
            storeCurrentAddress(action.newAddress!);
            return {
                ...state,
                accounts,
                axiosFactory: buildAxiosFactory(accounts),
            };
        }
        case 'SET_ADDRESSES':
            return {
                ...state,
                injectedAccounts: action.injectedAccounts!,
                accounts: action.accounts!,
                axiosFactory: buildAxiosFactory(action.accounts!),
            };
        case 'FETCH_IN_PROGRESS':
            return {
                ...state,
                fetchForAddress: action.dataAddress!,
                balances: action.clearOnRefresh ? null : state.balances,
                transactions: action.clearOnRefresh ? null : state.transactions,
            };
        case 'SET_DATA':
            if(action.dataAddress === state.fetchForAddress) {
                return {
                    ...state,
                    fetchForAddress: null,
                    dataAddress: action.dataAddress!,
                    balances: action.balances!,
                    transactions: action.transactions!,
                    pendingLocRequests: action.pendingLocRequests!,
                    openedLocRequests: action.openedLocRequests!,
                    closedLocRequests: action.closedLocRequests!,
                    rejectedLocRequests: action.rejectedLocRequests!,
                    openedIdentityLocs: action.openedIdentityLocs!,
                    closedIdentityLocs: action.closedIdentityLocs!,
                    voidTransactionLocs: action.voidTransactionLocs!,
                    voidIdentityLocs: action.voidIdentityLocs!,
                };
            } else {
                return state;
            }
        case 'SET_SET_COLOR_THEME':
            return {
                ...state,
                setColorTheme: action.setColorTheme!,
            };
        case 'SET_COLOR_THEME':
            return {
                ...state,
                colorTheme: action.newColorTheme!,
            };
        case 'SET_SET_TOKEN':
            return {
                ...state,
                setTokens: action.setTokens!,
            };
        case 'SET_TOKENS': {
            const tokens = state.tokens.merge(action.newTokens!);
            storeTokens(tokens);
            const accounts = buildAccounts(state.injectedAccounts!, state.accounts?.current?.address, tokens);
            return {
                ...state,
                tokens,
                accounts,
                axiosFactory: buildAxiosFactory(accounts),
            };
        }
        case 'SET_LOGOUT':
            return {
                ...state,
                logout: action.logout!,
            };
        case 'LOGOUT': {
            clearTokens();
            clearCurrentAddress();
            const tokens = new AccountTokens({});
            const accounts = buildAccounts(state.injectedAccounts!, undefined, tokens);
            clearInterval(state.timer!);
            return {
                ...state,
                tokens,
                accounts,
                axiosFactory: buildAxiosFactory(accounts),
            };
        }
        case 'SCHEDULE_TOKEN_REFRESH':
            if(state.timer === undefined) {
                return {
                    ...state,
                    timer: action.timer!
                };
            } else {
                clearInterval(action.timer!);
                return state;
            }
        case 'REFRESH_TOKENS':
            const tokens = state.tokens.refresh(moment());
            if(!tokens.equals(state.tokens)) {
                storeTokens(tokens);
                const accounts = buildAccounts(state.injectedAccounts!, state.accounts?.current?.address, tokens);
                return {
                    ...state,
                    tokens,
                    accounts
                }
            } else {
                return state;
            }
        case 'SET_REFRESH':
            return {
                ...state,
                refresh: action.refresh!,
                refreshAddress: action.refreshAddress!,
            };
        default:
            /* istanbul ignore next */
            throw new Error(`Unknown type: ${action.type}`);
    }
}

export function CommonContextProvider(props: Props) {
    const { apiState, api, injectedAccounts } = useLogionChain();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue());

    const refreshRequests = useCallback((clearOnRefresh?: boolean) => {
        if(api !== null && contextValue !== null
                && contextValue.accounts !== null
                && contextValue.accounts.current !== undefined) {
            const currentAccount = contextValue.accounts.current;
            const currentAddress = currentAccount.address;
            dispatch({
                type: "FETCH_IN_PROGRESS",
                dataAddress: currentAddress,
                clearOnRefresh: clearOnRefresh !== undefined ? clearOnRefresh : true
            });

            (async function () {
                const balances = await getBalances({
                    api: api!,
                    accountId: currentAddress
                });

                const transactions = await fetchTransactionsGivenAccount(contextValue.accounts!, contextValue.axiosFactory!);

                let specificationFragment: FetchLocRequestSpecification;
                if(currentAccount.isLegalOfficer) {
                    specificationFragment = {
                        ownerAddress: currentAddress,
                        statuses: [],
                        locTypes: []
                    }
                } else {
                    specificationFragment = {
                        requesterAddress: currentAddress,
                        statuses: [],
                        locTypes: []
                    }
                }

                const pendingLocRequests = await fetchLocRequestsGivenAccount(currentAccount, contextValue.axiosFactory!, {
                    ...specificationFragment,
                    statuses: ["REQUESTED"]
                });

                const openedLocRequestsOnly = await fetchLocRequestsGivenAccount(currentAccount, contextValue.axiosFactory!, {
                    ...specificationFragment,
                    statuses: ["OPEN"],
                    locTypes: ['Transaction']
                });

                const closedLocRequestsOnly = await fetchLocRequestsGivenAccount(currentAccount, contextValue.axiosFactory!, {
                    ...specificationFragment,
                    statuses: ["CLOSED"],
                    locTypes: ['Transaction']
                });

                const rejectedLocRequests = await fetchLocRequestsGivenAccount(currentAccount, contextValue.axiosFactory!, {
                    ...specificationFragment,
                    statuses: ["REJECTED"]
                });

                const openedIdentityLocsOnly = await fetchLocRequestsGivenAccount(currentAccount, contextValue.axiosFactory!, {
                    ...specificationFragment,
                    statuses: ["OPEN"],
                    locTypes: ['Identity']
                });

                const closedIdentityLocsOnly = await fetchLocRequestsGivenAccount(currentAccount, contextValue.axiosFactory!, {
                    ...specificationFragment,
                    statuses: ["CLOSED"],
                    locTypes: ['Identity']
                });

                let locIds = openedLocRequestsOnly.map(loc => new UUID(loc.id));
                locIds = locIds.concat(closedLocRequestsOnly.map(loc => new UUID(loc.id)));
                locIds = locIds.concat(openedIdentityLocsOnly.map(loc => new UUID(loc.id)));
                locIds = locIds.concat(closedIdentityLocsOnly.map(loc => new UUID(loc.id)));
                const locs = await getLegalOfficerCasesMap({
                    api: api!,
                    locIds
                });

                let voidTransactionLocs = voidRequestsAndLocs(openedLocRequestsOnly, locs);
                voidTransactionLocs = voidTransactionLocs.concat(voidRequestsAndLocs(closedLocRequestsOnly, locs));

                let voidIdentityLocs = openedIdentityLocsOnly
                    .map(request => ({request, loc: locs[toDecimalString((request.id))]}))
                    .filter(requestAndLoc => requestAndLoc.loc !== undefined && requestAndLoc.loc.voidInfo !== undefined);
                voidIdentityLocs = voidIdentityLocs.concat(closedIdentityLocsOnly
                    .map(request => ({request, loc: locs[toDecimalString((request.id))]}))
                    .filter(requestAndLoc => requestAndLoc.loc !== undefined && requestAndLoc.loc.voidInfo !== undefined));

                const openedLocRequests = openedLocRequestsOnly
                    .map(request => ({request, loc: locs[toDecimalString((request.id))]}))
                    .filter(requestAndLoc => requestAndLoc.loc !== undefined && requestAndLoc.loc.voidInfo === undefined);
                const closedLocRequests = closedLocRequestsOnly
                    .map(request => ({request, loc: locs[toDecimalString((request.id))]}))
                    .filter(requestAndLoc => requestAndLoc.loc !== undefined && requestAndLoc.loc.voidInfo === undefined);
                const openedIdentityLocs = openedIdentityLocsOnly
                    .map(request => ({request, loc: locs[toDecimalString((request.id))]}))
                    .filter(requestAndLoc => requestAndLoc.loc !== undefined && requestAndLoc.loc.voidInfo === undefined);
                const closedIdentityLocs = closedIdentityLocsOnly
                    .map(request => ({request, loc: locs[toDecimalString((request.id))]}))
                    .filter(requestAndLoc => requestAndLoc.loc !== undefined && requestAndLoc.loc.voidInfo === undefined);

                dispatch({
                    type: "SET_DATA",
                    dataAddress: currentAddress,
                    balances,
                    transactions,
                    pendingLocRequests,
                    openedLocRequests,
                    closedLocRequests,
                    rejectedLocRequests,
                    openedIdentityLocs,
                    closedIdentityLocs,
                    voidTransactionLocs,
                    voidIdentityLocs,
                });
            })();
        }
    }, [ api, dispatch, contextValue ]);

    function voidRequestsAndLocs(requests: LocRequest[], locs: Record<string, LegalOfficerCase>): RequestAndLoc[] {
        return requests
            .map(request => ({request, loc: locs[toDecimalString((request.id))]}))
            .filter(requestAndLoc => requestAndLoc.loc !== undefined && requestAndLoc.loc.voidInfo !== undefined);
    }

    useEffect(() => {
        if(apiState === "READY"
                && contextValue.accounts !== null
                && contextValue.accounts.current !== undefined
                && contextValue.dataAddress !== contextValue.accounts.current.address
                && contextValue.fetchForAddress !== contextValue.accounts.current.address) {
            refreshRequests();
        }
    }, [ apiState, contextValue, refreshRequests, dispatch ]);

    useEffect(() => {
        if(contextValue.selectAddress === null) {
            const selectAddress = (address: string) => {
                dispatch({
                    type: 'SELECT_ADDRESS',
                    newAddress: address,
                })
            }
            dispatch({
                type: 'SET_SELECT_ADDRESS',
                selectAddress,
            });
        }
    }, [ contextValue ]);

    useEffect(() => {
        if(contextValue.setColorTheme === null) {
            const setColorTheme = (colorTheme: ColorTheme) => {
                dispatch({
                    type: 'SET_COLOR_THEME',
                    newColorTheme: colorTheme,
                })
            }
            dispatch({
                type: 'SET_SET_COLOR_THEME',
                setColorTheme,
            });
        }
    }, [ contextValue ]);

    useEffect(() => {
        if(contextValue.injectedAccounts !== injectedAccounts
                && injectedAccounts !== null) {
            let currentAddress: string | null | undefined = loadCurrentAddress();
            if(currentAddress === null) {
                currentAddress = contextValue.accounts?.current?.address;
            }
            dispatch({
                type: 'SET_ADDRESSES',
                injectedAccounts,
                accounts: buildAccounts(injectedAccounts, currentAddress, contextValue.tokens)
            });
        }
    }, [ injectedAccounts, contextValue ]);

    useEffect(() => {
        if(contextValue.setTokens === DEFAULT_NOOP) {
            const setTokens = (tokens: AccountTokens) => {
                dispatch({
                    type: 'SET_TOKENS',
                    newTokens: tokens,
                })
            }
            dispatch({
                type: 'SET_SET_TOKEN',
                setTokens,
            });
        }
    }, [ contextValue ]);

    useEffect(() => {
        if(contextValue.logout === DEFAULT_NOOP) {
            const logout = () => dispatch({ type: 'LOGOUT' });
            dispatch({
                type: 'SET_LOGOUT',
                logout,
            });
        }
    }, [ contextValue ]);

    useEffect(() => {
        if(contextValue.timer === undefined) {
            const timer = window.setInterval(() => {
                dispatch({
                    type: 'REFRESH_TOKENS',
                });
            }, 1000);
            dispatch({
                type: 'SCHEDULE_TOKEN_REFRESH',
                timer
            });
        }
    }, [ contextValue ]);

    useEffect(() => {
        if(contextValue.accounts !== null
                && contextValue.accounts.current !== undefined
                && contextValue.refreshAddress !== contextValue.accounts.current.address) {
            dispatch({
                type: 'SET_REFRESH',
                refresh: refreshRequests,
                refreshAddress: contextValue.accounts.current.address,
            });
        }
    }, [ contextValue, refreshRequests, dispatch ]);

    return (
        <CommonContextObject.Provider value={contextValue}>
            {props.children}
        </CommonContextObject.Provider>
    );
}

export function useCommonContext(): CommonContext {
    return useContext(CommonContextObject);
}

async function fetchLocRequestsGivenAccount(currentAccount: Account, axiosFactory: AxiosFactory, specification: FetchLocRequestSpecification): Promise<LocRequest[]> {
        return fetchGivenAccount(currentAccount, axiosFactory, axios => fetchLocRequests(axios, specification));
    }

async function fetchGivenAccount<E>(currentAccount: Account, axiosFactory: AxiosFactory, query: (axios: AxiosInstance) => Promise<E[]>): Promise<E[]> {
    if(currentAccount.isLegalOfficer) {
        return await query(axiosFactory(currentAccount.address));
    } else {
        return await fetchFromAvailableNodes(axiosFactory, axios => query(axios));
    }
}

async function fetchTransactionsGivenAccount(accounts: Accounts, axiosFactory: AxiosFactory): Promise<Transaction[]> {
    const currentAccount = accounts.current!;
    let axios;
    if(currentAccount.isLegalOfficer) {
        axios = axiosFactory(currentAccount.address);
    } else {
        axios = anyNodeAxios(accounts);
    }
    return (await getTransactions(axios, {
        address: currentAccount.address
    })).transactions;
}
