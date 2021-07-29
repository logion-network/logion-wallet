import React, { useContext, useEffect, useReducer, Reducer, useCallback } from "react";
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import { useLogionChain } from '../logion-chain';
import { CoinBalance, getBalances } from '../logion-chain/Balances';

import Addresses, { buildAddresses } from './types/Addresses';
import { Children } from './types/Helpers';
import { Transaction } from './types/ModelTypes';
import { getTransactions } from "./Model";
import { ColorTheme, DEFAULT_COLOR_THEME } from "./ColorTheme";

export interface CommonContext {
    currentAddress: string,
    selectAddress: ((address: string) => void) | null,
    addresses: Addresses | null,
    injectedAccounts: InjectedAccountWithMeta[] | null,
    fetchForAddress: string | null,
    dataAddress: string | null,
    balances: CoinBalance[] | null,
    transactions: Transaction[] | null,
    colorTheme: ColorTheme,
    setColorTheme: ((colorTheme: ColorTheme) => void) | null,
}

function initialContextValue(): CommonContext {
    return {
        currentAddress: "",
        selectAddress: null,
        addresses: null,
        injectedAccounts: null,
        fetchForAddress: null,
        dataAddress: null,
        balances: null,
        transactions: null,
        colorTheme: DEFAULT_COLOR_THEME,
        setColorTheme: null,
    }
}

const CommonContextObject: React.Context<CommonContext> = React.createContext(initialContextValue());

export interface Props {
    children: Children
}

type ActionType = 'SET_SELECT_ADDRESS'
    | 'SELECT_ADDRESS'
    | 'SET_ADDRESSES'
    | 'FETCH_IN_PROGRESS'
    | 'SET_DATA'
    | 'SET_COLOR_THEME'
    | 'SET_SET_COLOR_THEME';

interface Action {
    type: ActionType,
    selectAddress?: ((address: string) => void),
    newAddress?: string,
    currentAddress?: string,
    addresses?: Addresses,
    injectedAccounts?: InjectedAccountWithMeta[],
    dataAddress?: string,
    balances?: CoinBalance[],
    transactions?: Transaction[],
    newColorTheme?: ColorTheme,
    setColorTheme?: ((colorTheme: ColorTheme) => void),
}

const reducer: Reducer<CommonContext, Action> = (state: CommonContext, action: Action): CommonContext => {
    switch (action.type) {
        case 'SET_SELECT_ADDRESS':
            return {
                ...state,
                selectAddress: action.selectAddress!
            };
        case 'SELECT_ADDRESS':
            return {
                ...state,
                currentAddress: action.newAddress!,
                addresses: buildAddresses(state.injectedAccounts!, action.newAddress!),
            };
        case 'SET_ADDRESSES':
            return {
                ...state,
                injectedAccounts: action.injectedAccounts!,
                currentAddress: action.currentAddress!,
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
        default:
            /* istanbul ignore next */
            throw new Error(`Unknown type: ${action.type}`);
    }
}

export function CommonContextProvider(props: Props) {
    const { apiState, api, injectedAccounts } = useLogionChain();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue());

    const refreshRequests = useCallback(() => {
        if(api !== null && contextValue !== null && contextValue.currentAddress !== '') {
            const currentAddress = contextValue.currentAddress;
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
                && contextValue.currentAddress !== ''
                && contextValue.dataAddress !== contextValue.currentAddress
                && contextValue.fetchForAddress !== contextValue.currentAddress) {
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

            let selectedAddress = contextValue.currentAddress;
            if(selectedAddress === "" && injectedAccounts.length > 0) {
                selectedAddress = injectedAccounts[0].address;
            }

            dispatch({
                type: 'SET_ADDRESSES',
                injectedAccounts,
                currentAddress: selectedAddress,
                addresses: buildAddresses(injectedAccounts, selectedAddress)
            });
        }
    }, [ injectedAccounts, contextValue ]);

    return (
        <CommonContextObject.Provider value={contextValue}>
            {props.children}
        </CommonContextObject.Provider>
    );
}

export function useCommonContext(): CommonContext {
    return {...useContext(CommonContextObject)};
}
