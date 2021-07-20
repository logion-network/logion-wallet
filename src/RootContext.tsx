import React, { useContext, useEffect, useReducer, Reducer } from "react";

import Addresses, { buildAddresses } from './common/types/Addresses';
import { Children } from './common/types/Helpers';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { useLogionChain } from './logion-chain';

export interface RootContext {
    currentAddress: string,
    selectAddress: ((address: string) => void) | null,
    addresses: Addresses | null,
    injectedAccounts: InjectedAccountWithMeta[] | null,
}

function initialContextValue(): RootContext {
    return {
        currentAddress: "",
        selectAddress: null,
        addresses: null,
        injectedAccounts: null,
    }
}

const RootContextObject: React.Context<RootContext> = React.createContext(initialContextValue());

export interface Props {
    children: Children
}

type ActionType = 'SET_SELECT_ADDRESS'
    | 'SELECT_ADDRESS'
    | 'SET_ADDRESSES';

interface Action {
    type: ActionType,
    selectAddress?: ((address: string) => void),
    newAddress?: string,
    currentAddress?: string,
    addresses?: Addresses,
    injectedAccounts?: InjectedAccountWithMeta[],
}

const reducer: Reducer<RootContext, Action> = (state: RootContext, action: Action): RootContext => {
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
        default:
            /* istanbul ignore next */
            throw new Error(`Unknown type: ${action.type}`);
    }
}

export function RootContextProvider(props: Props) {
    const { injectedAccounts } = useLogionChain();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue());

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
        <RootContextObject.Provider value={contextValue}>
            {props.children}
        </RootContextObject.Provider>
    );
}

export function useRootContext(): RootContext {
    return {...useContext(RootContextObject)};
}
