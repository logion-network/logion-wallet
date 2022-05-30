import React, { useContext, useEffect, useReducer, Reducer, useCallback } from "react";
import { DateTime } from 'luxon';
import { LegalOfficerCase, IdentityLocType, LocType, DataLocType } from "@logion/node-api/dist/Types";
import { toDecimalString, UUID } from "@logion/node-api/dist/UUID";
import { getLegalOfficerCasesMap } from "@logion/node-api/dist/LogionLoc";
import { LegalOfficer } from "@logion/client/dist/Types";
import { InjectedAccount } from "@logion/extension";

import { useLogionChain } from '../logion-chain';
import {
    MultiSourceHttpClient,
    Endpoint,
    allUp,
    aggregateArrays,
} from './api';
import { Children } from './types/Helpers';
import { LocRequest } from './types/ModelTypes';
import { FetchLocRequestSpecification, fetchLocRequests } from "./Model";
import { ColorTheme, DEFAULT_COLOR_THEME } from "./ColorTheme";
import { BalanceState } from "@logion/client/dist/Balance";

const DEFAULT_NOOP = () => {};

export interface LegalOfficerEndpoint extends Endpoint {
    legalOfficer: string;
}

export interface RequestAndLoc {
    request: LocRequest;
    loc?: LegalOfficerCase;
}

export interface CommonContext {
    fetchForAddress: string | null;
    dataAddress: string | null;
    balanceState?: BalanceState;
    pendingLocRequests: Record<DataLocType, LocRequest[]> | null;
    rejectedLocRequests: Record<DataLocType, LocRequest[]> | null;
    openedLocRequests: Record<DataLocType, RequestAndLoc[]> | null;
    closedLocRequests: Record<DataLocType, RequestAndLoc[]> | null;
    openedIdentityLocs: RequestAndLoc[] | null;
    openedIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null;
    closedIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null;
    colorTheme: ColorTheme;
    setColorTheme: ((colorTheme: ColorTheme) => void) | null;
    refresh: (clearOnRefresh: boolean) => void;
    voidTransactionLocs: Record<DataLocType, RequestAndLoc[]> | null;
    voidIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null;
    nodesUp: Endpoint[];
    nodesDown: Endpoint[];
    availableLegalOfficers: LegalOfficer[] | undefined;
    mutateBalanceState: (mutator: ((state: BalanceState) => Promise<BalanceState>)) => Promise<void>,
}

interface FullCommonContext extends CommonContext {
    refreshAddress?: string;
}

function initialContextValue(): FullCommonContext {
    return {
        fetchForAddress: null,
        dataAddress: null,
        pendingLocRequests: null,
        rejectedLocRequests: null,
        openedLocRequests: null,
        closedLocRequests: null,
        openedIdentityLocs: null,
        openedIdentityLocsByType: null,
        closedIdentityLocsByType: null,
        colorTheme: DEFAULT_COLOR_THEME,
        setColorTheme: null,
        refresh: DEFAULT_NOOP,
        voidTransactionLocs: null,
        voidIdentityLocsByType: null,
        nodesUp: [],
        nodesDown: [],
        availableLegalOfficers: undefined,
        mutateBalanceState: () => Promise.reject(),
    }
}

const CommonContextObject: React.Context<FullCommonContext> = React.createContext(initialContextValue());

export interface Props {
    children: Children
}

type ActionType = 'FETCH_IN_PROGRESS'
    | 'SET_DATA'
    | 'SET_COLOR_THEME'
    | 'SET_SET_COLOR_THEME'
    | 'SET_SET_TOKEN'
    | 'SET_REFRESH'
    | 'SET_MUTATE_BALANCE_STATE'
    | 'MUTATE_BALANCE_STATE'
;

interface Action {
    type: ActionType,
    injectedAccounts?: InjectedAccount[],
    dataAddress?: string,
    balanceState?: BalanceState,
    newColorTheme?: ColorTheme,
    setColorTheme?: ((colorTheme: ColorTheme) => void),
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
    nodesUp?: Endpoint[];
    nodesDown?: Endpoint[];
    availableLegalOfficers?: LegalOfficer[];
    mutateBalanceState?: (mutator: ((state: BalanceState) => Promise<BalanceState>)) => Promise<void>,
}

const reducer: Reducer<FullCommonContext, Action> = (state: FullCommonContext, action: Action): FullCommonContext => {
    switch (action.type) {
        case 'FETCH_IN_PROGRESS':
            return {
                ...state,
                fetchForAddress: action.dataAddress!,
                balanceState: action.clearOnRefresh ? undefined : state.balanceState,
            };
        case 'SET_DATA':
            if(action.dataAddress === state.fetchForAddress) {
                const nodesUp = action.nodesUp !== undefined ? action.nodesUp : state.nodesUp;
                const nodesDown = action.nodesDown !== undefined ? action.nodesDown : state.nodesDown;
                return {
                    ...state,
                    fetchForAddress: null,
                    dataAddress: action.dataAddress!,
                    balanceState: action.balanceState!,
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
        case 'SET_REFRESH':
            return {
                ...state,
                refresh: action.refresh!,
                refreshAddress: action.refreshAddress!,
            };
        case 'SET_MUTATE_BALANCE_STATE':
            return {
                ...state,
                mutateBalanceState: action.mutateBalanceState!,
            };
        case 'MUTATE_BALANCE_STATE':
            return {
                ...state,
                balanceState: action.balanceState!,
            };
        default:
            /* istanbul ignore next */
            throw new Error(`Unknown type: ${action.type}`);
    }
}

export function CommonContextProvider(props: Props) {
    const { api, client, accounts } = useLogionChain();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue());

    const refreshRequests = useCallback((clearOnRefresh?: boolean) => {
        const now = DateTime.now();
        if(api !== null
                && accounts !== null
                && accounts.current !== undefined
                && client !== null
                && client.isTokenValid(now)) {

            const currentAccount = accounts.current;
            const currentAddress = currentAccount.address;
            dispatch({
                type: "FETCH_IN_PROGRESS",
                dataAddress: currentAddress,
                clearOnRefresh: clearOnRefresh !== undefined ? clearOnRefresh : true
            });

            (async function () {
                const balanceState = await client.balanceState();

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
                    initialState = allUp<LegalOfficerEndpoint>(client.legalOfficers
                        .filter(legalOfficer => legalOfficer.address === currentAccount.address)
                        .map(legalOfficer => ({url: legalOfficer.node, legalOfficer: legalOfficer.address})));
                } else {
                    initialState = allUp<LegalOfficerEndpoint>(client.legalOfficers.map(legalOfficer => ({
                        url: legalOfficer.node,
                        legalOfficer: legalOfficer.address
                    })));
                }

                const multiClient = new MultiSourceHttpClient<LegalOfficerEndpoint, LocRequest[]>(initialState, currentAccount.token?.value);

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
                    nodesUp = client.legalOfficers
                        .filter(legalOfficer => legalOfficer.node !== legalOfficerNode.url)
                        .map(legalOfficer => ({url: legalOfficer.node}));
                }

                let availableLegalOfficers: LegalOfficer[];
                if(nodesDown) {
                    const unavailableNodesSet = new Set(nodesDown.map(endpoint => endpoint.url));
                    availableLegalOfficers = client.legalOfficers.filter(legalOfficer => legalOfficer.node && !unavailableNodesSet.has(legalOfficer.node));
                } else {
                    availableLegalOfficers = client.legalOfficers;
                }

                dispatch({
                    type: "SET_DATA",
                    dataAddress: currentAddress,
                    balanceState,
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
                });
            })();
        }
    }, [ api, dispatch, accounts, client ]);

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

    useEffect(() => {
        if(api !== null
                && client !== null
                && client.isTokenValid(DateTime.now())
                && accounts !== null
                && accounts.current !== undefined
                && contextValue.dataAddress !== accounts.current.address
                && contextValue.fetchForAddress !== accounts.current.address) {
            refreshRequests();
        }
    }, [ api, contextValue, refreshRequests, accounts, client ]);

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
        if(accounts !== null
                && accounts.current !== undefined
                && contextValue.refreshAddress !== accounts.current.address
                && client !== null) {
            dispatch({
                type: 'SET_REFRESH',
                refresh: refreshRequests,
                refreshAddress: accounts.current.address,
            });
        }
    }, [ contextValue, refreshRequests, dispatch, accounts, client ]);

    const mutateBalanceStateCallback = useCallback(async (mutator: ((state: BalanceState) => Promise<BalanceState>)) => {
        const balanceState = await mutator(contextValue.balanceState!);
        dispatch({
            type: "MUTATE_BALANCE_STATE",
            balanceState,
        });
    }, [ contextValue.balanceState, dispatch ]);

    useEffect(() => {
        if(contextValue.mutateBalanceState !== mutateBalanceStateCallback) {
            dispatch({
                type: "SET_MUTATE_BALANCE_STATE",
                mutateBalanceState: mutateBalanceStateCallback,
            })
        }
    }, [ contextValue.mutateBalanceState, mutateBalanceStateCallback ]);

    return (
        <CommonContextObject.Provider value={contextValue}>
            {props.children}
        </CommonContextObject.Provider>
    );
}

export function useCommonContext(): CommonContext {
    return useContext(CommonContextObject);
}
