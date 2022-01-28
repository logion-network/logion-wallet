import React, { useReducer, useContext, Context, Reducer } from 'react';

import config, { Node } from '../config';

import { ApiPromise } from '@polkadot/api';
import { Header, Extrinsic, Hash, Block } from '@polkadot/types/interfaces';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import { ExtrinsicsAndHead } from './Blocks';
import { enableExtensions } from './Keys';
import { NodeMetadata, buildApi } from './Connection';

///
// Initial state for `useReducer`

type ConsumptionStatus = 'PENDING' | 'STARTING' | 'STARTED';

export interface ExtrinsicFetchSpecification {
    after?: Date,
    maxResults: number,
    head: Hash | Block,
    matcher: (extrinsic: Extrinsic) => boolean,
    since?: ExtrinsicsAndHead | null
}

export interface LogionChainContextType {
    api: ApiPromise | null,
    injectedAccountsConsumptionState: ConsumptionStatus
    injectedAccounts: InjectedAccountWithMeta[] | null,
    edgeNodes: Node[],
    connectedNodeMetadata: NodeMetadata | null,
    extensionsEnabled: boolean,
}

export interface FullLogionChainContextType extends LogionChainContextType {
    connecting: boolean,
}

const initState = (): FullLogionChainContextType => ({
    api: null,
    injectedAccountsConsumptionState: 'PENDING',
    injectedAccounts: null,
    edgeNodes: config.edgeNodes,
    connectedNodeMetadata: null,
    extensionsEnabled: false,
    connecting: false,
});

type ActionType =
    'CONNECT_INIT'
    | 'CONNECT_SUCCESS'
    | 'START_INJECTED_ACCOUNTS_CONSUMPTION'
    | 'INJECTED_ACCOUNTS_CONSUMPTION_STARTED'
    | 'SET_INJECTED_ACCOUNTS'
    | 'SET_NODE_METADATA'
    | 'EXTENSIONS_ENABLED';

interface Action {
    type: ActionType,
    api?: ApiPromise,
    error?: string,
    lastHeader?: Header,
    injectedAccounts?: InjectedAccountWithMeta[],
    connectedNodeMetadata?: NodeMetadata,
}

const reducer: Reducer<FullLogionChainContextType, Action> = (state: FullLogionChainContextType, action: Action): FullLogionChainContextType => {
    switch (action.type) {
        case 'CONNECT_INIT':
            return { ...state, connecting: true };

        case 'CONNECT_SUCCESS':
            return { ...state, api: action.api! };

        case 'START_INJECTED_ACCOUNTS_CONSUMPTION':
            return { ...state, injectedAccountsConsumptionState: 'STARTING' };

        case 'INJECTED_ACCOUNTS_CONSUMPTION_STARTED':
            return { ...state, injectedAccountsConsumptionState: 'STARTED' };

        case 'SET_INJECTED_ACCOUNTS':
            return { ...state, injectedAccounts: action.injectedAccounts! };

        case 'SET_NODE_METADATA':
            return { ...state, connectedNodeMetadata: action.connectedNodeMetadata! };

        case 'EXTENSIONS_ENABLED':
            return { ...state, extensionsEnabled: true };

        default:
            /* istanbul ignore next */
            throw new Error(`Unknown type: ${action.type}`);
    }
};

///
// Connecting to the LogionChain node

const connect = (state: FullLogionChainContextType, dispatch: React.Dispatch<Action>) => {
    if(state.connecting) {
        return;
    }

    dispatch({ type: 'CONNECT_INIT' });
    (async function() {
        const api = await buildApi();
        dispatch({ type: 'CONNECT_SUCCESS', api });
        const peerId = await api.rpc.system.localPeerId();
        dispatch({type: 'SET_NODE_METADATA', connectedNodeMetadata: {
            peerId : peerId.toString()
        }})
    })();
};

const LogionChainContext: Context<FullLogionChainContextType> = React.createContext<FullLogionChainContextType>(initState());

async function consumeInjectedAccounts(state: LogionChainContextType, dispatch: React.Dispatch<Action>) {
    if(state.injectedAccountsConsumptionState === 'PENDING') {
        dispatch({type: 'START_INJECTED_ACCOUNTS_CONSUMPTION'});
    } else if(state.injectedAccountsConsumptionState === 'STARTING') {
        dispatch({type: 'INJECTED_ACCOUNTS_CONSUMPTION_STARTED'});
        const register = await enableExtensions(config.APP_NAME);
        dispatch({type: 'EXTENSIONS_ENABLED'});
        register((accounts: InjectedAccountWithMeta[]) => {
            dispatch({type: 'SET_INJECTED_ACCOUNTS', injectedAccounts: accounts});
        });
    }
}

interface LogionChainContextProviderProps {
    children: JSX.Element,
}

let timeout: NodeJS.Timeout | null = null;

const LogionChainContextProvider = (props: LogionChainContextProviderProps): JSX.Element => {
    const [state, dispatch] = useReducer(reducer, initState());

    connect(state, dispatch);
    if(timeout !== null) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(() => consumeInjectedAccounts(state, dispatch), 100);

    return <LogionChainContext.Provider value={state}>
        {props.children}
    </LogionChainContext.Provider>;
};

const useLogionChain = () => useContext(LogionChainContext);

export { LogionChainContextProvider, useLogionChain };
