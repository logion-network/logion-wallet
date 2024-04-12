import React, { useContext, useEffect, useReducer, Reducer, useCallback } from "react";
import { DateTime } from 'luxon';
import { LegalOfficerClass, BalanceState, LogionClient, Endpoint } from "@logion/client";
import { InjectedAccount } from "@logion/extension";
import { ValidAccountId } from "@logion/node-api";

import { useLogionChain } from '../logion-chain';
import { Children } from './types/Helpers';
import { ColorTheme, DEFAULT_COLOR_THEME } from "./ColorTheme";

export interface BackendConfig {
    features: {
        iDenfy: boolean;
        vote: boolean;
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
    nodesUp: LegalOfficerEndpoint[];
    nodesDown: LegalOfficerEndpoint[];
    availableLegalOfficers: LegalOfficerClass[] | undefined;
    mutateBalanceState: (mutator: ((state: BalanceState) => Promise<BalanceState>)) => Promise<void>,
    viewer: Viewer;
    setViewer: ((viewer: Viewer) => void) | null;
    backendConfig: ((legalOfficerAddress: ValidAccountId | undefined) => BackendConfig);
    expectNewTransactionState: ExpectNewTransactionState;
    expectNewTransaction: () => void;
    stopExpectNewTransaction: () => void;
    notificationText?: string;
    setNotification: (text?: string) => void;
}

interface FullCommonContext extends CommonContext {
    dataAddress: string | null;
    refreshAddress?: string;
    client?: LogionClient;
}

const DEFAULT_BACKEND_CONFIG: BackendConfig = {
    features: {
        iDenfy: false,
        vote: false,
    }
};

export enum ExpectNewTransactionStatus {
    IDLE,
    WAITING_NEW_TRANSACTION,
    DONE
}

export interface ExpectNewTransactionState {
    status: ExpectNewTransactionStatus;
    minExpectedTransactions?: number;
    refreshCount: number;
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
        backendConfig: () => DEFAULT_BACKEND_CONFIG,
        expectNewTransactionState: {
            status: ExpectNewTransactionStatus.IDLE,
            refreshCount: 0,
        },
        expectNewTransaction: () => {},
        stopExpectNewTransaction: () => {},
        setNotification: () => {},
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
    | 'EXPECT_NEW_TRANSACTION'
    | 'SET_EXPECT_NEW_TRANSACTION'
    | 'STOP_EXPECT_NEW_TRANSACTION'
    | 'SET_STOP_EXPECT_NEW_TRANSACTION'
    | 'SET_NOTIFICATION'
    | 'SET_SET_NOTIFICATION'
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
    nodesUp?: LegalOfficerEndpoint[];
    nodesDown?: LegalOfficerEndpoint[];
    availableLegalOfficers?: LegalOfficerClass[];
    mutateBalanceState?: (mutator: ((state: BalanceState) => Promise<BalanceState>)) => Promise<void>;
    client?: LogionClient;
    viewer?: Viewer;
    setViewer?: (viewer: Viewer) => void;
    backendConfig?: ((legalOfficerAddress: ValidAccountId | undefined) => BackendConfig);
    expectNewTransaction?: () => void;
    stopExpectNewTransaction?: () => void;
    notificationText?: string;
    setNotification?: (text?: string) => void;
}

const MAX_REFRESH_COUNT = 12;
const REFRESH_PERIOD_MS = 3000;

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
                const expectNewTransactionState = buildNextExpectNewTransactionState(state.expectNewTransactionState, state.balanceState);
                if(expectNewTransactionState.status === ExpectNewTransactionStatus.WAITING_NEW_TRANSACTION) {
                    console.log(`Scheduling retry #${expectNewTransactionState.refreshCount} (${state.balanceState!.transactions?.length} < ${state.expectNewTransactionState.minExpectedTransactions!})...`);
                    window.setTimeout(() => {
                        console.log(`Try #${ expectNewTransactionState.refreshCount }...`);
                        state.refresh(false);
                    }, REFRESH_PERIOD_MS);
                } else {
                    console.log(`Stopped polling after ${state.expectNewTransactionState.refreshCount} retries  (${state.balanceState?.transactions.length} >= ${state.expectNewTransactionState.minExpectedTransactions!})`);
                }
                return {
                    ...state,
                    balanceState: action.balanceState,
                    availableLegalOfficers: action.availableLegalOfficers!,
                    backendConfig: action.backendConfig!,
                    nodesUp,
                    nodesDown,
                    expectNewTransactionState,
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
        case 'SET_EXPECT_NEW_TRANSACTION':
            return {
                ...state,
                expectNewTransaction: action.expectNewTransaction!,
            }
        case 'EXPECT_NEW_TRANSACTION':
            if(state.expectNewTransactionState.status === ExpectNewTransactionStatus.IDLE || state.expectNewTransactionState.status === ExpectNewTransactionStatus.DONE) {
                window.setTimeout(() => {
                    console.log(`Try #1...`);
                    state.refresh(false);
                }, REFRESH_PERIOD_MS);
                return {
                    ...state,
                    expectNewTransactionState: {
                        status: ExpectNewTransactionStatus.WAITING_NEW_TRANSACTION,
                        minExpectedTransactions: state.balanceState ? state.balanceState.transactions.length + 1 : 1,
                        refreshCount: 1,
                    },
                }
            } else {
                return state;
            }
        case 'SET_STOP_EXPECT_NEW_TRANSACTION':
            return {
                ...state,
                stopExpectNewTransaction: action.stopExpectNewTransaction!,
            };
        case 'STOP_EXPECT_NEW_TRANSACTION':
            return {
                ...state,
                expectNewTransactionState: {
                    status: ExpectNewTransactionStatus.IDLE,
                    minExpectedTransactions: undefined,
                    refreshCount: 0,
                },
            };
        case "SET_NOTIFICATION": {
            return {
                ...state,
                notificationText: action.notificationText,
            };
        }
        case "SET_SET_NOTIFICATION": {
            return {
                ...state,
                setNotification: action.setNotification!,
            };
        }
        default:
            /* istanbul ignore next */
            throw new Error(`Unknown type: ${action.type}`);
    }
}

function buildNextExpectNewTransactionState(current: ExpectNewTransactionState, balanceState?: BalanceState): ExpectNewTransactionState {
    if(current.status === ExpectNewTransactionStatus.WAITING_NEW_TRANSACTION) {
        if(balanceState
            && (balanceState.transactions.length >= current.minExpectedTransactions!
                || current.refreshCount >= MAX_REFRESH_COUNT)) {
            return {
                status: ExpectNewTransactionStatus.DONE,
                minExpectedTransactions: undefined,
                refreshCount: 0,
            };
        } else {
            const refreshCount = current.refreshCount + 1;
            return {
                status: ExpectNewTransactionStatus.WAITING_NEW_TRANSACTION,
                refreshCount,
                minExpectedTransactions: current.minExpectedTransactions,
            };
        }
    } else {
        return current;
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
            const currentAddress = currentAccount.accountId;
            dispatch({
                type: "FETCH_IN_PROGRESS",
                dataAddress: currentAddress.toKey(),
                clearOnRefresh: clearOnRefresh !== undefined ? clearOnRefresh : true,
                client,
            });

            (async function () {
                let balanceState: BalanceState | undefined;
                if(accounts.current?.accountId.type === "Polkadot") {
                    balanceState = await client.balanceState();
                }

                const configPromises = await Promise.allSettled(client.legalOfficers.map(legalOfficer => legalOfficer.getConfig()));
                const backendConfigs: Record<string, BackendConfig> = {};
                for(let i = 0; i < configPromises.length; ++i) {
                    const promiseResult = configPromises[i];
                    if(promiseResult.status === 'fulfilled') {
                        backendConfigs[client.legalOfficers[i].account.address] = promiseResult.value;
                    }
                }

                const backendConfig = (legalOfficerAddress: ValidAccountId | undefined) => {
                    if(!legalOfficerAddress || !(legalOfficerAddress.address in backendConfigs)) {
                        return DEFAULT_BACKEND_CONFIG;
                    } else {
                        return backendConfigs[legalOfficerAddress.address];
                    }
                };

                const networkState = client.networkState;
                const nodesDown = networkState.nodesDown;
                const nodesUp = networkState.nodesUp;
                const availableLegalOfficers = client.legalOfficers;

                dispatch({
                    type: "SET_DATA",
                    dataAddress: currentAddress.toKey(),
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
                && ((contextValue.dataAddress !== accounts.current.accountId.toKey()) || (contextValue.client !== client))) {
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

    const expectNewTransaction = useCallback(() => {
        dispatch({ type: "EXPECT_NEW_TRANSACTION" });
    }, [ ]);

    useEffect(() => {
        if(contextValue.expectNewTransaction !== expectNewTransaction) {
            dispatch({
                type: "SET_EXPECT_NEW_TRANSACTION",
                expectNewTransaction,
            })
        }
    }, [ contextValue.expectNewTransaction, expectNewTransaction ]);

    const stopExpectNewTransaction = useCallback(() => {
        dispatch({ type: "STOP_EXPECT_NEW_TRANSACTION" });
    }, [ ]);

    useEffect(() => {
        if(contextValue.stopExpectNewTransaction !== stopExpectNewTransaction) {
            dispatch({
                type: "SET_STOP_EXPECT_NEW_TRANSACTION",
                stopExpectNewTransaction,
            })
        }
    }, [ contextValue.stopExpectNewTransaction, stopExpectNewTransaction ]);

    const setNotification = useCallback((text?: string) => {
        dispatch({
            type: "SET_NOTIFICATION",
            notificationText: text,
        });
    }, [ ]);

    useEffect(() => {
        if(contextValue.setNotification !== setNotification) {
            dispatch({
                type: "SET_SET_NOTIFICATION",
                setNotification,
            })
        }
    }, [ contextValue.setNotification, setNotification ]);

    return (
        <CommonContextObject.Provider value={contextValue}>
            {props.children}
        </CommonContextObject.Provider>
    );
}

export function useCommonContext(): CommonContext {
    return useContext(CommonContextObject);
}
