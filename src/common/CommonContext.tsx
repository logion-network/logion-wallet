import React, { useContext, useEffect, useReducer, Reducer, useCallback } from "react";
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import moment from 'moment';

import { useLogionChain } from '../logion-chain';
import { CoinBalance, getBalances } from '../logion-chain/Balances';

import config, { Node } from '../config';
import { AxiosFactory, buildAxiosFactory, buildAxios, MultiSourceHttpClient, Endpoint, allUp, aggregateArrays, MultiResponse, AnySourceHttpClient } from './api';
import Accounts, { buildAccounts, AccountTokens } from './types/Accounts';
import { Children } from './types/Helpers';
import { Transaction, LocRequest, TransactionsSet } from './types/ModelTypes';
import { getTransactions, FetchLocRequestSpecification, fetchLocRequests } from "./Model";
import { ColorTheme, DEFAULT_COLOR_THEME } from "./ColorTheme";
import { storeTokens, clearTokens, loadTokens, storeCurrentAddress, loadCurrentAddress, clearCurrentAddress } from './Storage';
import { LegalOfficerCase } from "../logion-chain/Types";
import { toDecimalString, UUID } from "../logion-chain/UUID";
import { getLegalOfficerCasesMap } from "../logion-chain/LogionLoc";
import { authenticate } from "./Authentication";

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
    isCurrentAuthenticated: () => boolean;
    authenticate: (address: string[]) => Promise<void>;
    nodesUp: Node[];
    nodesDown: Node[];
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
        isCurrentAuthenticated: () => false,
        authenticate: (_: string[]) => Promise.reject(),
        nodesUp: config.availableNodes,
        nodesDown: []
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
    | 'SET_REFRESH'
    | 'SET_AUTHENTICATE';

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
    authenticate?: (address: string[]) => Promise<void>;
    nodesUp?: Node[];
    nodesDown?: Node[];
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
                isCurrentAuthenticated: () => state.tokens.isAuthenticated(moment(), accounts.current?.address),
            };
        }
        case 'SET_ADDRESSES':
            const accounts = action.accounts!;
            return {
                ...state,
                injectedAccounts: action.injectedAccounts!,
                accounts,
                axiosFactory: buildAxiosFactory(accounts),
                isCurrentAuthenticated: () => state.tokens.isAuthenticated(moment(), accounts.current?.address),
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
                const nodesUp = action.nodesUp !== undefined ? action.nodesUp : state.nodesUp;
                const nodesDown = action.nodesDown !== undefined ? action.nodesDown : state.nodesDown;
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
                    nodesUp,
                    nodesDown,
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
                isCurrentAuthenticated: () => tokens.isAuthenticated(moment(), accounts.current?.address),
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
                isCurrentAuthenticated: () => false,
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
                    accounts,
                    isCurrentAuthenticated: () => tokens.isAuthenticated(moment(), accounts.current?.address),
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
        case 'SET_AUTHENTICATE':
            return {
                ...state,
                authenticate: action.authenticate!,
            };
        default:
            /* istanbul ignore next */
            throw new Error(`Unknown type: ${action.type}`);
    }
}

export function CommonContextProvider(props: Props) {
    const { api, injectedAccounts } = useLogionChain();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue());

    const refreshRequests = useCallback((clearOnRefresh?: boolean) => {
        const now = moment();
        if(api !== null && contextValue !== null
                && contextValue.accounts !== null
                && contextValue.accounts.current !== undefined
                && contextValue.tokens.isAuthenticated(now, contextValue.accounts.current.address)) {
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

                let initialState;
                if(currentAccount.isLegalOfficer) {
                    initialState = allUp<Endpoint>(config.availableNodes
                        .filter(node => node.owner === currentAccount.address)
                        .map(node => ({url: node.api})));
                } else {
                    initialState = allUp<Endpoint>(config.availableNodes.map(node => ({url: node.api})));
                }

                const anyClient = new AnySourceHttpClient<Endpoint, TransactionsSet>(initialState, currentAccount.token?.value);
                const transactionsSet = await anyClient.fetch(axios => getTransactions(axios, {
                    address: currentAccount.address
                }));
                const transactions = transactionsSet?.transactions || [];

                const multiClient = new MultiSourceHttpClient<Endpoint, LocRequest[]>(anyClient.getState(), currentAccount.token?.value);
                let result: MultiResponse<LocRequest[]>;

                result = await multiClient.fetch(axios => fetchLocRequests(axios, {
                    ...specificationFragment,
                    statuses: ["REQUESTED"]
                }));
                const pendingLocRequests = aggregateArrays<LocRequest>(result);

                result = await multiClient.fetch(axios => fetchLocRequests(axios, {
                    ...specificationFragment,
                    statuses: ["OPEN"],
                    locTypes: ['Transaction']
                }));
                const openedLocRequestsOnly = aggregateArrays<LocRequest>(result);

                result = await multiClient.fetch(axios => fetchLocRequests(axios, {
                    ...specificationFragment,
                    statuses: ["CLOSED"],
                    locTypes: ['Transaction']
                }));
                const closedLocRequestsOnly = aggregateArrays<LocRequest>(result);

                result = await multiClient.fetch(axios => fetchLocRequests(axios, {
                    ...specificationFragment,
                    statuses: ["REJECTED"]
                }));
                const rejectedLocRequests = aggregateArrays<LocRequest>(result);

                result = await multiClient.fetch(axios => fetchLocRequests(axios, {
                    ...specificationFragment,
                    statuses: ["OPEN"],
                        locTypes: ['Identity']
                }));
                const openedIdentityLocsOnly = aggregateArrays<LocRequest>(result);

                result = await multiClient.fetch(axios => fetchLocRequests(axios, {
                    ...specificationFragment,
                    statuses: ["CLOSED"],
                    locTypes: ['Identity']
                }));
                const closedIdentityLocsOnly = aggregateArrays<LocRequest>(result);

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

                let nodesUp: Node[] | undefined;
                let nodesDown: Node[] | undefined;
                const resultingState = multiClient.getState();
                if(!currentAccount.isLegalOfficer) {
                    nodesUp = resultingState.nodesUp
                        .map(endpoint => config.availableNodes.find(node => node.api === endpoint.url)!);
                    nodesDown = resultingState.nodesDown
                        .map(endpoint => config.availableNodes.find(node => node.api === endpoint.url)!);
                } else if(resultingState.nodesDown.length > 0) {
                    const legalOfficerNode = resultingState.nodesDown[0];
                    nodesUp = config.availableNodes
                        .filter(node => node.api !== legalOfficerNode.url);
                    nodesDown = [ config.availableNodes.find(node => node.api === legalOfficerNode.url)! ];
                }

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
                    nodesUp,
                    nodesDown,
                });
            })();
        }
    }, [ api, dispatch, contextValue ]);

    function voidRequestsAndLocs(requests: LocRequest[], locs: Record<string, LegalOfficerCase>): RequestAndLoc[] {
        return requests
            .map(request => ({request, loc: locs[toDecimalString((request.id))]}))
            .filter(requestAndLoc => requestAndLoc.loc !== undefined && requestAndLoc.loc.voidInfo !== undefined);
    }

    const authenticateCallback = useCallback(async (address: string[]) => {
        for(let i = 0; i < config.availableNodes.length; ++i) {
            const node = config.availableNodes[i];
            try {
                const tokens = await authenticate(buildAxios(contextValue.accounts!, node), address);
                dispatch({type: 'SET_TOKENS', newTokens: tokens});
                break;
            } catch(error) {}
        }
    }, [ contextValue.accounts ]);

    useEffect(() => {
        if(api !== null
                && contextValue.accounts !== null
                && contextValue.accounts.current !== undefined
                && contextValue.dataAddress !== contextValue.accounts.current.address
                && contextValue.fetchForAddress !== contextValue.accounts.current.address) {
            refreshRequests();
        }
    }, [ api, contextValue, refreshRequests, dispatch ]);

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
                && injectedAccounts !== null
                && contextValue.accounts?.current === undefined) {
            let currentAddress: string | null | undefined = loadCurrentAddress();
            const now = moment();
            if(currentAddress === null || !contextValue.tokens.isAuthenticated(now, currentAddress)) {
                currentAddress = undefined;
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

    useEffect(() => {
        if(contextValue.authenticate !== authenticateCallback) {
            dispatch({
                type: 'SET_AUTHENTICATE',
                authenticate: authenticateCallback
            });
        }
    }, [ contextValue.authenticate, authenticateCallback ]);

    return (
        <CommonContextObject.Provider value={contextValue}>
            {props.children}
        </CommonContextObject.Provider>
    );
}

export function useCommonContext(): CommonContext {
    return useContext(CommonContextObject);
}
