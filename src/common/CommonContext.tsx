import React, { useContext, useEffect, useReducer, Reducer, useCallback } from "react";
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import { useLogionChain } from '../logion-chain';
import { CoinBalance, getBalances } from '../logion-chain/Balances';

import Addresses, { buildAddresses, AccountTokens, Token } from './types/Addresses';
import { Children } from './types/Helpers';
import { Transaction } from './types/ModelTypes';
import { getTransactions } from "./Model";
import { ColorTheme, DEFAULT_COLOR_THEME } from "./ColorTheme";

const DEFAULT_NOOP = () => {};

export interface CommonContext {
    selectAddress: ((address: string) => void) | null;
    addresses: Addresses | null;
    fetchForAddress: string | null;
    dataAddress: string | null;
    balances: CoinBalance[] | null;
    transactions: Transaction[] | null;
    colorTheme: ColorTheme;
    setColorTheme: ((colorTheme: ColorTheme) => void) | null;
    setToken: (address: string, token: Token) => void;
    logout: () => void;
}

interface FullCommonContext extends CommonContext {
    injectedAccounts: InjectedAccountWithMeta[] | null;
    tokens: AccountTokens;
}

function initialContextValue(): FullCommonContext {
    return {
        selectAddress: null,
        addresses: null,
        injectedAccounts: null,
        fetchForAddress: null,
        dataAddress: null,
        balances: null,
        transactions: null,
        colorTheme: DEFAULT_COLOR_THEME,
        setColorTheme: null,
        tokens: {},
        setToken: DEFAULT_NOOP,
        logout: DEFAULT_NOOP,
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
    | 'SET_TOKEN'
    | 'SET_LOGOUT'
    | 'LOGOUT';

interface Action {
    type: ActionType,
    selectAddress?: ((address: string) => void),
    newAddress?: string,
    addresses?: Addresses,
    injectedAccounts?: InjectedAccountWithMeta[],
    dataAddress?: string,
    balances?: CoinBalance[],
    transactions?: Transaction[],
    newColorTheme?: ColorTheme,
    setColorTheme?: ((colorTheme: ColorTheme) => void),
    setToken?: (address: string, token: Token) => void,
    newToken?: {
        address: string,
        token: Token
    },
    logout?: () => void,
}

const reducer: Reducer<FullCommonContext, Action> = (state: FullCommonContext, action: Action): FullCommonContext => {
    switch (action.type) {
        case 'SET_SELECT_ADDRESS':
            return {
                ...state,
                selectAddress: action.selectAddress!
            };
        case 'SELECT_ADDRESS':
            return {
                ...state,
                addresses: buildAddresses(state.injectedAccounts!, action.newAddress!, state.tokens),
            };
        case 'SET_ADDRESSES':
            return {
                ...state,
                injectedAccounts: action.injectedAccounts!,
                addresses: action.addresses!,
            };
        case 'FETCH_IN_PROGRESS':
            return {
                ...state,
                fetchForAddress: action.dataAddress!,
                balances: null,
                transactions: null,
            };
        case 'SET_DATA':
            if(action.dataAddress === state.fetchForAddress) {
                return {
                    ...state,
                    fetchForAddress: null,
                    dataAddress: action.dataAddress!,
                    balances: action.balances!,
                    transactions: action.transactions!,
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
                setToken: action.setToken!,
            };
        case 'SET_TOKEN':
            const tokens = { ...state.tokens };
            tokens[action.newToken!.address] = action.newToken!.token;
            return {
                ...state,
                tokens,
                addresses: buildAddresses(state.injectedAccounts!, state.addresses?.currentAddress?.address, tokens),
            };
        case 'SET_LOGOUT':
            return {
                ...state,
                logout: action.logout!,
            };
        case 'LOGOUT':
            return {
                ...state,
                tokens: {},
                addresses: buildAddresses(state.injectedAccounts!, undefined, {}),
            };
        default:
            /* istanbul ignore next */
            throw new Error(`Unknown type: ${action.type}`);
    }
}

export function CommonContextProvider(props: Props) {
    const { apiState, api, injectedAccounts } = useLogionChain();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue());

    const refreshRequests = useCallback(() => {
        if(api !== null && contextValue !== null
                && contextValue.addresses !== null
                && contextValue.addresses.currentAddress !== undefined) {
            const currentAddress = contextValue.addresses.currentAddress.address;
            dispatch({
                type: "FETCH_IN_PROGRESS",
                dataAddress: currentAddress,
            });

            (async function () {
                const balances = await getBalances({
                    api: api!,
                    accountId: currentAddress
                });

                const transactions = await getTransactions({
                    address: currentAddress
                });

                dispatch({
                    type: "SET_DATA",
                    dataAddress: currentAddress,
                    balances,
                    transactions: transactions.transactions,
                });
            })();
        }
    }, [ api, dispatch, contextValue ]);

    useEffect(() => {
        if(apiState === "READY"
                && contextValue.addresses !== null
                && contextValue.addresses.currentAddress !== undefined
                && contextValue.dataAddress !== contextValue.addresses.currentAddress.address
                && contextValue.fetchForAddress !== contextValue.addresses.currentAddress.address) {
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

            dispatch({
                type: 'SET_ADDRESSES',
                injectedAccounts,
                addresses: buildAddresses(injectedAccounts, contextValue.addresses?.currentAddress?.address, contextValue.tokens)
            });
        }
    }, [ injectedAccounts, contextValue ]);

    useEffect(() => {
        if(contextValue.setToken === DEFAULT_NOOP) {
            const setToken = (address: string, token: Token) => {
                dispatch({
                    type: 'SET_TOKEN',
                    newToken: {
                        address,
                        token
                    },
                })
            }
            dispatch({
                type: 'SET_SET_TOKEN',
                setToken,
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

    return (
        <CommonContextObject.Provider value={contextValue}>
            {props.children}
        </CommonContextObject.Provider>
    );
}

export function useCommonContext(): CommonContext {
    return useContext(CommonContextObject);
}
