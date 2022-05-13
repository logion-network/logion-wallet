import React, { useContext, useEffect, useReducer, Reducer, useCallback } from "react";
import { DateTime } from 'luxon';
import { CoinBalance, getBalances } from '@logion/node-api/dist/Balances';
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
    AnySourceHttpClient,
} from './api';
import { Children } from './types/Helpers';
import { Transaction, LocRequest, TransactionsSet } from './types/ModelTypes';
import { getTransactions, FetchLocRequestSpecification, fetchLocRequests } from "./Model";
import { ColorTheme, DEFAULT_COLOR_THEME } from "./ColorTheme";
import { FetchVaultTransferRequest, VaultApi, VaultTransferRequest } from "../vault/VaultApi";

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
    refresh: (clearOnRefresh?: boolean) => void;
    voidTransactionLocs: Record<DataLocType, RequestAndLoc[]> | null;
    voidIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null;
    nodesUp: Endpoint[];
    nodesDown: Endpoint[];
    availableLegalOfficers: LegalOfficer[] | undefined;
    pendingVaultTransferRequests: ((onlyRegular: boolean) => VaultTransferRequest[]) | undefined;
    cancelledVaultTransferRequests: ((onlyRegular: boolean) => VaultTransferRequest[]) | undefined;
    rejectedVaultTransferRequests: ((onlyRegular: boolean) => VaultTransferRequest[]) | undefined;
    vaultTransferRequestsHistory: ((onlyRegular: boolean) => VaultTransferRequest[]) | undefined;
    cancelableVaultRecoveryRequest: ((recoveredAddress: string) => VaultTransferRequest | null) | undefined;
}

interface FullCommonContext extends CommonContext {
    refreshAddress?: string;
}

function initialContextValue(): FullCommonContext {
    return {
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
        refresh: DEFAULT_NOOP,
        voidTransactionLocs: null,
        voidIdentityLocsByType: null,
        nodesUp: [],
        nodesDown: [],
        availableLegalOfficers: undefined,
        pendingVaultTransferRequests: undefined,
        cancelledVaultTransferRequests: undefined,
        rejectedVaultTransferRequests: undefined,
        vaultTransferRequestsHistory: undefined,
        cancelableVaultRecoveryRequest: undefined,
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
;

interface Action {
    type: ActionType,
    injectedAccounts?: InjectedAccount[],
    dataAddress?: string,
    balances?: CoinBalance[],
    transactions?: Transaction[],
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
    pendingVaultTransferRequests?: ((onlyRegular: boolean) => VaultTransferRequest[]);
    cancelledVaultTransferRequests?: ((onlyRegular: boolean) => VaultTransferRequest[]);
    rejectedVaultTransferRequests?: ((onlyRegular: boolean) => VaultTransferRequest[]);
    vaultTransferRequestsHistory?: ((onlyRegular: boolean) => VaultTransferRequest[]);
    cancelableVaultRecoveryRequest?: ((recoveredAddress: string) => VaultTransferRequest | null);
}

const reducer: Reducer<FullCommonContext, Action> = (state: FullCommonContext, action: Action): FullCommonContext => {
    switch (action.type) {
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
                    pendingVaultTransferRequests: action.pendingVaultTransferRequests!,
                    cancelledVaultTransferRequests: action.cancelledVaultTransferRequests!,
                    rejectedVaultTransferRequests: action.rejectedVaultTransferRequests!,
                    vaultTransferRequestsHistory: action.vaultTransferRequestsHistory!,
                    cancelableVaultRecoveryRequest: action.cancelableVaultRecoveryRequest,
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
                    initialState = allUp<LegalOfficerEndpoint>(client.legalOfficers
                        .filter(legalOfficer => legalOfficer.address === currentAccount.address)
                        .map(legalOfficer => ({url: legalOfficer.node, legalOfficer: legalOfficer.address})));
                } else {
                    initialState = allUp<LegalOfficerEndpoint>(client.legalOfficers.map(legalOfficer => ({
                        url: legalOfficer.node,
                        legalOfficer: legalOfficer.address
                    })));
                }

                const anyClient = new AnySourceHttpClient<LegalOfficerEndpoint, TransactionsSet>(initialState, currentAccount.token?.value);
                const transactionsSet = await anyClient.fetch(axios => getTransactions(axios, {
                    address: currentAccount.address
                }));
                const transactions = transactionsSet?.transactions || [];

                const multiClient = new MultiSourceHttpClient<LegalOfficerEndpoint, LocRequest[]>(anyClient.getState(), currentAccount.token?.value);

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

                const vaultTransferRequestsMultiClient = new MultiSourceHttpClient<LegalOfficerEndpoint, VaultTransferRequest[]>(multiClient.getState(),
                    currentAccount.token?.value);
                let vaultSpecificationFragment: FetchVaultTransferRequest;
                if(currentAccount.isLegalOfficer) {
                    vaultSpecificationFragment = {
                        statuses: []
                    }
                } else {
                    vaultSpecificationFragment = {
                        requesterAddress: currentAddress,
                        statuses: []
                    }
                }
                const vaultTransferRequestsResult = await vaultTransferRequestsMultiClient.fetch((axios, endpoint) => new VaultApi(axios, endpoint.legalOfficer).getVaultTransferRequests({
                    ...vaultSpecificationFragment,
                    statuses: [ "PENDING" ]
                }));
                const pendingVaultTransferRequests = aggregateArrays(vaultTransferRequestsResult).sort((a, b) => b.createdOn.localeCompare(a.createdOn));

                const cancelledVaultTransferRequestsResult = await vaultTransferRequestsMultiClient.fetch((axios, endpoint) => new VaultApi(axios, endpoint.legalOfficer).getVaultTransferRequests({
                    ...vaultSpecificationFragment,
                    statuses: [ "CANCELLED", "REJECTED_CANCELLED" ]
                }));
                const cancelledVaultTransferRequests = aggregateArrays(cancelledVaultTransferRequestsResult).sort((a, b) => b.createdOn.localeCompare(a.createdOn));

                const rejectedVaultTransferRequestsResult = await vaultTransferRequestsMultiClient.fetch((axios, endpoint) => new VaultApi(axios, endpoint.legalOfficer).getVaultTransferRequests({
                    ...vaultSpecificationFragment,
                    statuses: [ "REJECTED" ]
                }));
                const rejectedVaultTransferRequests = aggregateArrays(rejectedVaultTransferRequestsResult).sort((a, b) => b.createdOn.localeCompare(a.createdOn));

                const acceptedVaultTransferRequestsResult = await vaultTransferRequestsMultiClient.fetch((axios, endpoint) => new VaultApi(axios, endpoint.legalOfficer).getVaultTransferRequests({
                    ...vaultSpecificationFragment,
                    statuses: [ "ACCEPTED" ]
                }));
                const acceptedVaultTransferRequests = aggregateArrays(acceptedVaultTransferRequestsResult).sort((a, b) => b.createdOn.localeCompare(a.createdOn));

                const vaultTransferRequestsHistory = cancelledVaultTransferRequests
                    .concat(rejectedVaultTransferRequests)
                    .concat(acceptedVaultTransferRequests)
                    .sort((a, b) => b.createdOn.localeCompare(a.createdOn));

                let nodesUp: Endpoint[] | undefined;
                let nodesDown: Endpoint[] | undefined;
                const resultingState = vaultTransferRequestsMultiClient.getState();
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
                    pendingVaultTransferRequests: filterableVaultRequests(pendingVaultTransferRequests, currentAddress),
                    cancelledVaultTransferRequests: filterableVaultRequests(cancelledVaultTransferRequests, currentAddress),
                    rejectedVaultTransferRequests: filterableVaultRequests(rejectedVaultTransferRequests, currentAddress),
                    vaultTransferRequestsHistory: filterableVaultRequests(vaultTransferRequestsHistory, currentAddress),
                    cancelableVaultRecoveryRequest: cancelableVaultRecoveryRequest(pendingVaultTransferRequests.concat(rejectedVaultTransferRequests)),
                });
            })();
        }
    }, [ api, dispatch, accounts, client ]);

    function filterableVaultRequests(vaultTransferRequests: VaultTransferRequest[], requesterAddress: string):
        (onlyRegular: boolean) => VaultTransferRequest[] {
        return (onlyRegular: boolean) => {
            if (!onlyRegular) {
                return vaultTransferRequests
            }
            return vaultTransferRequests.filter(vtr => vtr.origin === requesterAddress)
        }
    }

    function cancelableVaultRecoveryRequest(pendingOrRejectedVaultTransferRequests: VaultTransferRequest[]):
        ((recoveredAddress: string) => VaultTransferRequest | null) {
        return (recoveredAddress: string) => {
            return pendingOrRejectedVaultTransferRequests.find(vaultTransferRequest => vaultTransferRequest.origin === recoveredAddress) || null
        }
    }

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

    return (
        <CommonContextObject.Provider value={contextValue}>
            {props.children}
        </CommonContextObject.Provider>
    );
}

export function useCommonContext(): CommonContext {
    return useContext(CommonContextObject);
}
