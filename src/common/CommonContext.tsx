import React, { useContext, useEffect, useReducer, Reducer, useCallback } from "react";
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import moment from 'moment';

import { useLogionChain } from '../logion-chain';
import { CoinBalance, getBalances } from '../logion-chain/Balances';

import { LegalOfficer } from '../directory/DirectoryApi';
import {
    AxiosFactory,
    buildAxiosFactory,
    buildAxios,
    MultiSourceHttpClient,
    Endpoint,
    allUp,
    aggregateArrays,
    AnySourceHttpClient
} from './api';
import Accounts, { buildAccounts, AccountTokens } from './types/Accounts';
import { Children } from './types/Helpers';
import { Transaction, LocRequest, TransactionsSet } from './types/ModelTypes';
import { getTransactions, FetchLocRequestSpecification, fetchLocRequests } from "./Model";
import { ColorTheme, DEFAULT_COLOR_THEME } from "./ColorTheme";
import {
    storeTokens,
    clearTokens,
    loadTokens,
    storeCurrentAddress,
    loadCurrentAddress,
    clearCurrentAddress
} from './Storage';
import { LegalOfficerCase, IdentityLocType, LocType, DataLocType } from "../logion-chain/Types";
import { toDecimalString, UUID } from "../logion-chain/UUID";
import { getLegalOfficerCasesMap } from "../logion-chain/LogionLoc";
import { authenticate } from "./Authentication";
import { DirectoryContext, useDirectoryContext } from "../directory/DirectoryContext";
import config from "../config";

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
    pendingLocRequests: Record<DataLocType, LocRequest[]> | null;
    rejectedLocRequests: Record<DataLocType, LocRequest[]> | null;
    openedLocRequests: Record<DataLocType, RequestAndLoc[]> | null;
    closedLocRequests: Record<DataLocType, RequestAndLoc[]> | null;
    openedIdentityLocs: RequestAndLoc[] | null;
    openedIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null;
    closedIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null;
    colorTheme: ColorTheme;
    setColorTheme: ((colorTheme: ColorTheme) => void) | null;
    setTokens: (tokens: AccountTokens) => void;
    logout: () => void;
    axiosFactory?: AxiosFactory;
    refresh: (clearOnRefresh?: boolean) => void;
    voidTransactionLocs: Record<DataLocType, RequestAndLoc[]> | null;
    voidIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null;
    isCurrentAuthenticated: () => boolean;
    authenticate: (address: string[]) => Promise<void>;
    nodesUp: Endpoint[];
    nodesDown: Endpoint[];
    availableLegalOfficers: LegalOfficer[] | undefined;
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
        openedIdentityLocsByType: null,
        closedIdentityLocsByType: null,
        colorTheme: DEFAULT_COLOR_THEME,
        setColorTheme: null,
        tokens,
        setTokens: DEFAULT_NOOP,
        logout: DEFAULT_NOOP,
        refresh: DEFAULT_NOOP,
        voidTransactionLocs: null,
        voidIdentityLocsByType: null,
        isCurrentAuthenticated: () => false,
        authenticate: (_: string[]) => Promise.reject(),
        nodesUp: [],
        nodesDown: [],
        availableLegalOfficers: undefined,
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
    pendingLocRequests?: Record<DataLocType, LocRequest[]>;
    openedLocRequests?: Record<DataLocType, RequestAndLoc[]>;
    closedLocRequests?: Record<DataLocType, RequestAndLoc[]>;
    rejectedLocRequests?: Record<DataLocType, LocRequest[]>;
    openedIdentityLocs?: RequestAndLoc[];
    openedIdentityLocsByType?: Record<IdentityLocType, RequestAndLoc[]>;
    closedIdentityLocsByType?: Record<IdentityLocType, RequestAndLoc[]>;
    refresh?: (clearOnRefresh?: boolean) => void;
    refreshAddress?: string;
    clearOnRefresh?: boolean;
    voidTransactionLocs?: Record<DataLocType, RequestAndLoc[]>;
    voidIdentityLocsByType?: Record<IdentityLocType, RequestAndLoc[]>;
    authenticate?: (address: string[]) => Promise<void>;
    nodesUp?: Endpoint[];
    nodesDown?: Endpoint[];
    directoryContext?: DirectoryContext;
    availableLegalOfficers?: LegalOfficer[];
}

const reducer: Reducer<FullCommonContext, Action> = (state: FullCommonContext, action: Action): FullCommonContext => {
    switch (action.type) {
        case 'SET_SELECT_ADDRESS':
            return {
                ...state,
                selectAddress: action.selectAddress!
            };
        case 'SELECT_ADDRESS': {
            const accounts = buildAccounts(state.injectedAccounts!, action.newAddress!, state.tokens, action.directoryContext!.isLegalOfficer);
            storeCurrentAddress(action.newAddress!);
            return {
                ...state,
                accounts,
                axiosFactory: buildAxiosFactory(accounts, action.directoryContext!.legalOfficers!),
                isCurrentAuthenticated: () => state.tokens.isAuthenticated(moment(), accounts.current?.address),
            };
        }
        case 'SET_ADDRESSES':
            const accounts = action.accounts!;
            return {
                ...state,
                injectedAccounts: action.injectedAccounts!,
                accounts,
                axiosFactory: buildAxiosFactory(accounts, action.directoryContext!.legalOfficers!),
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
                    openedIdentityLocsByType: action.openedIdentityLocsByType!,
                    closedIdentityLocsByType: action.closedIdentityLocsByType!,
                    voidTransactionLocs: action.voidTransactionLocs!,
                    voidIdentityLocsByType: action.voidIdentityLocsByType!,
                    availableLegalOfficers: action.availableLegalOfficers!,
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
            const accounts = buildAccounts(state.injectedAccounts!, state.accounts?.current?.address, tokens, action.directoryContext!.isLegalOfficer);
            return {
                ...state,
                tokens,
                accounts,
                axiosFactory: buildAxiosFactory(accounts, action.directoryContext!.legalOfficers!),
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
            const accounts = buildAccounts(state.injectedAccounts!, undefined, tokens, action.directoryContext!.isLegalOfficer);
            clearInterval(state.timer!);
            return {
                ...state,
                tokens,
                accounts,
                axiosFactory: buildAxiosFactory(accounts, action.directoryContext!.legalOfficers!),
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
                const accounts = buildAccounts(state.injectedAccounts!, state.accounts?.current?.address, tokens, action.directoryContext!.isLegalOfficer);
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
    const directoryContext = useDirectoryContext();

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
                    initialState = allUp<Endpoint>(directoryContext.legalOfficers
                        .filter(legalOfficer => legalOfficer.address === currentAccount.address)
                        .map(legalOfficer => ({url: legalOfficer.node})));
                } else {
                    initialState = allUp<Endpoint>(directoryContext.legalOfficers.map(legalOfficer => ({url: legalOfficer.node})));
                }

                const anyClient = new AnySourceHttpClient<Endpoint, TransactionsSet>(initialState, currentAccount.token?.value);
                const transactionsSet = await anyClient.fetch(axios => getTransactions(axios, {
                    address: currentAccount.address
                }));
                const transactions = transactionsSet?.transactions || [];

                const multiClient = new MultiSourceHttpClient<Endpoint, LocRequest[]>(anyClient.getState(), currentAccount.token?.value);

                const fetchAndAggregate = async (specification: Partial<FetchLocRequestSpecification>) => {
                    const result = await multiClient.fetch(axios => fetchLocRequests(axios, {
                        ...specificationFragment,
                        ...specification
                    }));
                    return aggregateArrays<LocRequest>(result);
                }

                interface RequestsByType {
                    pending: LocRequest[],
                    rejected: LocRequest[],
                    opened: LocRequest[],
                    closed: LocRequest[],
                    locIds: UUID[]
                }

                async function fetchRequests(locType: LocType): Promise<RequestsByType> {
                    const pending = await fetchAndAggregate({
                        statuses: [ "REQUESTED" ],
                        locTypes: [ locType ]
                    })
                    const opened = await fetchAndAggregate({
                        statuses: [ "OPEN" ],
                        locTypes: [ locType ]
                    })
                    const closed = await fetchAndAggregate({
                        statuses: [ "CLOSED" ],
                        locTypes: [ locType ]
                    })
                    const rejected = await fetchAndAggregate({
                        statuses: [ "REJECTED" ],
                        locTypes: [ locType ]
                    })

                    let locIds = opened.map(loc => new UUID(loc.id))
                    locIds = locIds.concat(closed.map(loc => new UUID(loc.id)));

                    return { pending, rejected, opened, closed, locIds }
                }

                const openedIdentityLocsOnly = await fetchAndAggregate({
                    statuses: [ "OPEN" ],
                    locTypes: [ 'Identity' ]
                })
                const openedIdentityLocsOnlyPolkadot = await fetchAndAggregate({
                    statuses: [ "OPEN" ],
                    locTypes: [ 'Identity' ],
                    identityLocType: 'Polkadot'
                })
                const closedIdentityLocsOnlyPolkadot = await fetchAndAggregate({
                    statuses: [ "CLOSED" ],
                    locTypes: [ 'Identity' ],
                    identityLocType: 'Polkadot'
                })
                const openedIdentityLocsOnlyLogion = await fetchAndAggregate({
                    statuses: [ "OPEN" ],
                    locTypes: [ 'Identity' ],
                    identityLocType: 'Logion'
                })
                const closedIdentityLocsOnlyLogion = await fetchAndAggregate({
                    statuses: [ "CLOSED" ],
                    locTypes: [ 'Identity' ],
                    identityLocType: 'Logion'
                })

                const transactionLocs = await fetchRequests('Transaction');
                const collectionLocs = await fetchRequests('Collection');

                let locIds = transactionLocs.locIds
                    .concat(collectionLocs.locIds)
                    .concat(openedIdentityLocsOnly.map(loc => new UUID(loc.id)))
                    .concat(closedIdentityLocsOnlyPolkadot.map(loc => new UUID(loc.id)))
                    .concat(closedIdentityLocsOnlyLogion.map(loc => new UUID(loc.id)));
                const locs = await getLegalOfficerCasesMap({
                    api: api!,
                    locIds
                });

                const pendingLocRequests: Record<DataLocType, LocRequest[]> = {
                    'Transaction': transactionLocs.pending,
                    'Collection': collectionLocs.pending
                }
                const rejectedLocRequests: Record<DataLocType, LocRequest[]> = {
                    'Transaction': transactionLocs.rejected,
                    'Collection': collectionLocs.rejected
                }
                const openedLocRequests: Record<DataLocType, RequestAndLoc[]> = {
                    'Transaction': notVoidRequestsAndLocs(transactionLocs.opened, locs),
                    'Collection': notVoidRequestsAndLocs(collectionLocs.opened, locs)
                }
                const closedLocRequests: Record<DataLocType, RequestAndLoc[]> = {
                    'Transaction': notVoidRequestsAndLocs(transactionLocs.closed, locs),
                    'Collection': notVoidRequestsAndLocs(collectionLocs.closed, locs)
                }
                const voidTransactionLocs: Record<DataLocType, RequestAndLoc[]> = {
                    'Transaction': voidRequestsAndLocs(transactionLocs.opened, locs)
                        .concat(voidRequestsAndLocs(transactionLocs.closed, locs)),
                    'Collection': voidRequestsAndLocs(collectionLocs.opened, locs)
                        .concat(voidRequestsAndLocs(collectionLocs.closed, locs))
                }

                // Identity
                const openedIdentityLocs = notVoidRequestsAndLocs(openedIdentityLocsOnly, locs);

                const openedIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> = {
                    'Polkadot': notVoidRequestsAndLocs(openedIdentityLocsOnlyPolkadot, locs),
                    'Logion': notVoidRequestsAndLocs(openedIdentityLocsOnlyLogion, locs)
                };
                const closedIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> = {
                    'Polkadot': notVoidRequestsAndLocs(closedIdentityLocsOnlyPolkadot, locs),
                    'Logion': notVoidRequestsAndLocs(closedIdentityLocsOnlyLogion, locs)
                }
                const voidIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> = {
                    'Polkadot': voidRequestsAndLocs(openedIdentityLocsOnlyPolkadot, locs)
                        .concat(voidRequestsAndLocs(closedIdentityLocsOnlyPolkadot, locs)),
                    'Logion': voidRequestsAndLocs(openedIdentityLocsOnlyLogion, locs)
                        .concat(voidRequestsAndLocs(closedIdentityLocsOnlyLogion, locs))
                }

                let nodesUp: Endpoint[] | undefined;
                let nodesDown: Endpoint[] | undefined;
                const resultingState = multiClient.getState();
                if(!currentAccount.isLegalOfficer) {
                    nodesUp = resultingState.nodesUp;
                    nodesDown = resultingState.nodesDown;
                } else if(resultingState.nodesDown.length > 0) {
                    nodesDown = resultingState.nodesDown;
                    const legalOfficerNode = nodesDown[0];
                    nodesUp = directoryContext.legalOfficers
                        .filter(legalOfficer => legalOfficer.node !== legalOfficerNode.url)
                        .map(legalOfficer => ({url: legalOfficer.node}));
                }

                let availableLegalOfficers: LegalOfficer[];
                if(nodesDown) {
                    const unavailableNodesSet = new Set(nodesDown.map(endpoint => endpoint.url));
                    availableLegalOfficers = directoryContext.legalOfficers.filter(legalOfficer => legalOfficer.node && !unavailableNodesSet.has(legalOfficer.node));
                } else {
                    availableLegalOfficers = directoryContext.legalOfficers;
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
                    openedIdentityLocsByType,
                    closedIdentityLocsByType,
                    voidTransactionLocs,
                    voidIdentityLocsByType,
                    nodesUp,
                    nodesDown,
                    availableLegalOfficers,
                    directoryContext,
                });
            })();
        }
    }, [ api, dispatch, contextValue, directoryContext ]);

    function voidRequestsAndLocs(requests: LocRequest[], locs: Record<string, LegalOfficerCase>): RequestAndLoc[] {
        return requests
            .map(request => ({request, loc: locs[toDecimalString(request.id)]}))
            .filter(requestAndLoc => requestAndLoc.loc !== undefined && requestAndLoc.loc.voidInfo !== undefined);
    }

    function notVoidRequestsAndLocs(requests: LocRequest[], locs: Record<string, LegalOfficerCase>): RequestAndLoc[] {
        return requests
            .map(request => ({request, loc: locs[toDecimalString(request.id)]}))
            .filter(requestAndLoc => requestAndLoc.loc !== undefined && requestAndLoc.loc.voidInfo === undefined);
    }

    const authenticateCallback = useCallback(async (address: string[]) => {
        if(directoryContext.legalOfficers.length === 0) {
            const tokens = await authenticate(buildAxios(contextValue.accounts!, {url: config.directory}), address);
            dispatch({
                type: 'SET_TOKENS',
                newTokens: tokens,
                directoryContext,
            });
        } else {
            for(let i = 0; i < directoryContext.legalOfficers.length; ++i) {
                const legalOfficer = directoryContext.legalOfficers[i];
                try {
                    const tokens = await authenticate(buildAxios(contextValue.accounts!, {url: legalOfficer.node}), address);
                    dispatch({
                        type: 'SET_TOKENS',
                        newTokens: tokens,
                        directoryContext,
                    });
                    break;
                } catch(error) {}
            }
        }
    }, [ contextValue.accounts, directoryContext ]);

    const logout = useCallback(() => dispatch({
        type: 'LOGOUT',
        directoryContext,
    }), [ directoryContext ]);

    useEffect(() => {
        if(api !== null
                && directoryContext.ready
                && contextValue.accounts !== null
                && contextValue.accounts.current !== undefined
                && contextValue.dataAddress !== contextValue.accounts.current.address
                && contextValue.fetchForAddress !== contextValue.accounts.current.address) {
            refreshRequests();
        }
    }, [ api, directoryContext.ready, contextValue, refreshRequests, dispatch ]);

    useEffect(() => {
        if(contextValue.selectAddress === null) {
            const selectAddress = (address: string) => {
                dispatch({
                    type: 'SELECT_ADDRESS',
                    newAddress: address,
                    directoryContext,
                })
            }
            dispatch({
                type: 'SET_SELECT_ADDRESS',
                selectAddress,
                directoryContext,
            });
        }
    }, [ contextValue, directoryContext ]);

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
                && directoryContext.ready) {

            let currentAddress: string | null | undefined = contextValue.accounts?.current?.address;
            if(currentAddress === undefined) {
                currentAddress = loadCurrentAddress();
            }

            const now = moment();
            if(currentAddress === null || !contextValue.tokens.isAuthenticated(now, currentAddress)) {
                currentAddress = undefined;
            }

            dispatch({
                type: 'SET_ADDRESSES',
                injectedAccounts,
                accounts: buildAccounts(injectedAccounts, currentAddress, contextValue.tokens, directoryContext.isLegalOfficer),
                directoryContext,
            });
        }
    }, [ injectedAccounts, contextValue, directoryContext ]);

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
        if(contextValue.logout !== logout) {
            dispatch({
                type: 'SET_LOGOUT',
                logout,
            });
        }
    }, [ contextValue, logout ]);

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
