import React, { useContext, useEffect, useReducer, Reducer, useCallback } from "react";
import { DateTime } from 'luxon';
import { LegalOfficer, BalanceState, LogionClient, Endpoint, MultiResponse } from "@logion/client";
import { InjectedAccount } from "@logion/extension";

import { useLogionChain } from '../logion-chain';
import { Children } from './types/Helpers';
import { ColorTheme, DEFAULT_COLOR_THEME } from "./ColorTheme";

export interface BackendConfig {
    integrations: {
        iDenfy: boolean;
    };
}

const DEFAULT_NOOP = () => {};

export interface LegalOfficerEndpoint extends Endpoint {
    legalOfficer: string;
}

export type Viewer = 'User' | 'LegalOfficer';

export interface CommonContext {
    balanceState?: BalanceState;
    colorTheme: ColorTheme;
    setColorTheme: ((colorTheme: ColorTheme) => void) | null;
    refresh: (clearOnRefresh: boolean) => void;
    nodesUp: Endpoint[];
    nodesDown: Endpoint[];
    availableLegalOfficers: LegalOfficer[] | undefined;
    mutateBalanceState: (mutator: ((state: BalanceState) => Promise<BalanceState>)) => Promise<void>,
    viewer: Viewer;
    setViewer: ((viewer: Viewer) => void) | null;
    backendConfig: Record<string, BackendConfig>;
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
        viewer: "User",
        setViewer: null,
        backendConfig: {},
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
    | 'SET_SET_VIEWER'
    | 'SET_VIEWER'
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
    viewer?: Viewer;
    setViewer?: (viewer: Viewer) => void;
    backendConfig?: Record<string, BackendConfig>;
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
                    backendConfig: action.backendConfig!,
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
        case 'SET_SET_VIEWER':
            return {
                ...state,
                setViewer: action.setViewer!,
            };
        case 'SET_VIEWER':
            return {
                ...state,
                viewer: action.viewer!,
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

                const multiClient = client.buildMultiSourceHttpClient();
                const multiResponse = await multiClient.fetch<BackendConfig>(async axios => (await axios.get("/api/config")).data);
                const backendConfig = aggregateBackendConfig(multiResponse, client.legalOfficers);
                client.updateNetworkState(multiClient);

                const networkState = client.networkState;
                const nodesDown = networkState.nodesDown;
                const nodesUp = networkState.nodesUp;
                const availableLegalOfficers = client.legalOfficers;

                dispatch({
                    type: "SET_DATA",
                    dataAddress: currentAddress,
                    balanceState,
                    nodesUp,
                    nodesDown,
                    availableLegalOfficers,
                    backendConfig,
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

    useEffect(() => {
        if(contextValue.setViewer === null) {
            const setViewer = (viewer: Viewer) => {
                dispatch({
                    type: 'SET_VIEWER',
                    viewer,
                })
            }
            dispatch({
                type: 'SET_SET_VIEWER',
                setViewer,
            });
        }
    }, [ contextValue ]);

    return (
        <CommonContextObject.Provider value={contextValue}>
            {props.children}
        </CommonContextObject.Provider>
    );
}

export function useCommonContext(): CommonContext {
    return useContext(CommonContextObject);
}

function aggregateBackendConfig(response: MultiResponse<BackendConfig>, legalOfficers: LegalOfficer[]): Record<string, BackendConfig> {
    const config: Record<string, BackendConfig> = {};
    for(const url in response) {
        const legalOfficer = legalOfficers.find(legalOfficer => legalOfficer.node === url);
        if(legalOfficer) {
            config[legalOfficer.address] = response[url];
        }
    }
    return config;
}
