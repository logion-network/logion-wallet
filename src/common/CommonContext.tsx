import React, { useContext, useEffect, useReducer, Reducer, useCallback } from "react";
import { DateTime } from 'luxon';
import { LegalOfficer, LocRequest, BalanceState, LogionClient } from "@logion/client";
import { InjectedAccount } from "@logion/extension";

import { useLogionChain } from '../logion-chain';
import { MultiSourceHttpClient, Endpoint, allUp, } from './api';
import { Children } from './types/Helpers';
import { ColorTheme, DEFAULT_COLOR_THEME } from "./ColorTheme";

const DEFAULT_NOOP = () => {};

export interface LegalOfficerEndpoint extends Endpoint {
    legalOfficer: string;
}

export interface CommonContext {
    balanceState?: BalanceState;
    colorTheme: ColorTheme;
    setColorTheme: ((colorTheme: ColorTheme) => void) | null;
    refresh: (clearOnRefresh: boolean) => void;
    nodesUp: Endpoint[];
    nodesDown: Endpoint[];
    availableLegalOfficers: LegalOfficer[] | undefined;
    mutateBalanceState: (mutator: ((state: BalanceState) => Promise<BalanceState>)) => Promise<void>,
}

interface FullCommonContext extends CommonContext {
    dataAddress: string | null;
    refreshAddress?: string;
    client?: LogionClient;
}

function initialContextValue(): FullCommonContext {
    return {
        dataAddress: null,
        colorTheme: DEFAULT_COLOR_THEME,
        setColorTheme: null,
        refresh: DEFAULT_NOOP,
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
    refresh?: (clearOnRefresh?: boolean) => void;
    refreshAddress?: string;
    clearOnRefresh?: boolean;
    nodesUp?: Endpoint[];
    nodesDown?: Endpoint[];
    availableLegalOfficers?: LegalOfficer[];
    mutateBalanceState?: (mutator: ((state: BalanceState) => Promise<BalanceState>)) => Promise<void>;
    client?: LogionClient;
}

const reducer: Reducer<FullCommonContext, Action> = (state: FullCommonContext, action: Action): FullCommonContext => {
    switch (action.type) {
        case 'FETCH_IN_PROGRESS':
            return {
                ...state,
                dataAddress: action.dataAddress!,
                balanceState: action.clearOnRefresh ? undefined : state.balanceState,
                client: action.client!,
            };
        case 'SET_DATA':
            if(action.dataAddress === state.dataAddress) {
                const nodesUp = action.nodesUp !== undefined ? action.nodesUp : state.nodesUp;
                const nodesDown = action.nodesDown !== undefined ? action.nodesDown : state.nodesDown;
                return {
                    ...state,
                    balanceState: action.balanceState!,
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
                clearOnRefresh: clearOnRefresh !== undefined ? clearOnRefresh : true,
                client,
            });

            (async function () {
                const balanceState = await client.balanceState();

                let initialState;
                if(currentAccount.isLegalOfficer) {
                    initialState = allUp<LegalOfficerEndpoint>(client.legalOfficers
                        .filter(legalOfficer => legalOfficer.address === currentAccount.address)
                        .map(legalOfficer => ({url: legalOfficer.node, legalOfficer: legalOfficer.address})));
                } else {
                    initialState = allUp<LegalOfficerEndpoint>(client.legalOfficers
                        .filter(legalOfficer => legalOfficer.node)
                        .map(legalOfficer => ({ url: legalOfficer.node, legalOfficer: legalOfficer.address })));
                }

                const multiClient = new MultiSourceHttpClient<LegalOfficerEndpoint, LocRequest[]>(initialState, currentAccount.token?.value);

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
                    nodesUp,
                    nodesDown,
                    availableLegalOfficers,
                });
            })();
        }
    }, [ api, dispatch, accounts, client ]);

    useEffect(() => {
        if(api !== null
                && client && client.isTokenValid(DateTime.now())
                && accounts !== null
                && accounts.current !== undefined
                && ((contextValue.dataAddress !== accounts.current.address) || (contextValue.client !== client))) {
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
        if(contextValue.refresh !== refreshRequests) {
            dispatch({
                type: 'SET_REFRESH',
                refresh: refreshRequests,
            });
        }
    }, [ contextValue.refresh, refreshRequests ]);

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
