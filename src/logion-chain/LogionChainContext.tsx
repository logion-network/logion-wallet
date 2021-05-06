import React, { useReducer, useContext, Context, Reducer } from 'react';

import { Node, ConfigType, DEFAULT_CONFIG } from '../config';

import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import { ApiPromise, WsProvider } from '@polkadot/api';
import keyring from '@polkadot/ui-keyring';
import { EventRecord, Header, Extrinsic, Hash, Block } from '@polkadot/types/interfaces';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import { fetchExtrinsics, ExtrinsicsAndHead } from './Blocks';
import { enableExtensions } from './Keys';

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

export type ApiState= 'DISCONNECTED'
    | 'CONNECT_INIT'
    | 'CONNECTING'
    | 'READY'
    | 'ERROR';

export interface LogionChainContextType {
    appName: string,
    jsonrpc: any,
    types: any,
    api: ApiPromise | null,
    apiError: any,
    apiState: ApiState,
    eventsConsumption: ConsumptionStatus,
    events: EventRecord[],
    headerConsumption: ConsumptionStatus,
    lastHeader: Header | null,
    fetchExtrinsics: ((specification: ExtrinsicFetchSpecification) => Promise<ExtrinsicsAndHead>) | null,
    injectedAccountsConsumptionState: ConsumptionStatus
    injectedAccounts: InjectedAccountWithMeta[] | null,
    availableNodes: Node[],
    selectedNode: Node | null,
    connect: () => void,
    connectedNodeMetadata: NodeMetadata | null,
    extensionsEnabled: boolean,
}

const initState = (config: ConfigType): LogionChainContextType => ({
    appName: config.APP_NAME,
    jsonrpc: { ...jsonrpc, ...config.RPC },
    types: config.types,
    api: null,
    apiError: null,
    apiState: 'DISCONNECTED',
    eventsConsumption: 'PENDING',
    events: [],
    headerConsumption: 'PENDING',
    lastHeader: null,
    fetchExtrinsics: null,
    injectedAccountsConsumptionState: 'PENDING',
    injectedAccounts: null,
    availableNodes: config.availableNodes,
    selectedNode: null,
    connect: () => {},
    connectedNodeMetadata: null,
    extensionsEnabled: false,
});

type ActionType =
    'CONNECT_INIT'
    | 'CONNECT'
    | 'CONNECT_SUCCESS'
    | 'CONNECT_ERROR'
    | 'START_EVENT_CONSUMPTION'
    | 'NEW_EVENTS'
    | 'EVENT_CONSUMPTION_STARTED'
    | 'START_HEADER_CONSUMPTION'
    | 'SET_LAST_HEADER'
    | 'HEADER_CONSUMPTION_STARTED'
    | 'INJECTED_ACCOUNTS_CONSUMPTION_STARTED'
    | 'SET_INJECTED_ACCOUNTS'
    | 'SET_NODE_METADATA'
    | 'EXTENSIONS_ENABLED';

export interface NodeMetadata {
    name: string,
    peerId: string
}

interface Action {
    type: ActionType,
    api?: ApiPromise,
    error?: string,
    newEvents?: EventRecord[],
    lastHeader?: Header,
    injectedAccounts?: InjectedAccountWithMeta[],
    connectedNodeMetadata?: NodeMetadata,
}

const reducer: Reducer<LogionChainContextType, Action> = (state: LogionChainContextType, action: Action): LogionChainContextType => {
    switch (action.type) {
        case 'CONNECT_INIT':
            return { ...state, apiState: 'CONNECT_INIT' };

        case 'CONNECT':
            return { ...state, api: action.api!, apiState: 'CONNECTING' };

        case 'CONNECT_SUCCESS':
            return { ...state, apiState: 'READY' };

        case 'CONNECT_ERROR':
            return { ...state, apiState: 'ERROR', apiError: action.error };

        case 'START_EVENT_CONSUMPTION':
            return { ...state, eventsConsumption: 'STARTING' };
            
        case 'EVENT_CONSUMPTION_STARTED':
            return { ...state, eventsConsumption: 'STARTED' };

        case 'NEW_EVENTS':
            return { ...state, events: pushAndLimit(state.events, action.newEvents!) };

        case 'START_HEADER_CONSUMPTION':
            return { ...state, headerConsumption: 'STARTING' };
            
        case 'HEADER_CONSUMPTION_STARTED':
            return { ...state, headerConsumption: 'STARTED' };

        case 'SET_LAST_HEADER':
            return { ...state, lastHeader: action.lastHeader!, fetchExtrinsics: spec => fetchExtrinsics({...spec, api: state.api! }) };

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

function pushAndLimit(previousEvents: EventRecord[], newEvents: EventRecord[]): EventRecord[] {
    let events = previousEvents.concat(newEvents);
    if(events.length > 1024) {
        events = events.slice(-1024);
    }
    return events;
}

///
// Connecting to the LogionChain node

const connect = (state: LogionChainContextType, dispatch: React.Dispatch<Action>) => {
    const { apiState, selectedNode, jsonrpc, types } = state;
    if (apiState !== 'DISCONNECTED' || selectedNode === null) {
        return;
    }

    dispatch({ type: 'CONNECT_INIT' });

    const provider = new WsProvider(selectedNode.socket);
    const _api = new ApiPromise({ provider, types, rpc: jsonrpc });

    _api.on('connected', () => {
        dispatch({ type: 'CONNECT', api: _api });
        _api.isReady.then((_api) => {
            dispatch({ type: 'CONNECT_SUCCESS' });
            fetchConnectedNodeMetadata(_api, dispatch);
        });
    });

    _api.on('ready', () => {
        dispatch({ type: 'CONNECT_SUCCESS' });
        fetchConnectedNodeMetadata(_api, dispatch);
    });

    _api.on('error', err => dispatch({ type: 'CONNECT_ERROR', error: err }));
};

const fetchConnectedNodeMetadata = async (api: ApiPromise, dispatch: React.Dispatch<Action>) => {
    const nodeName = await api.rpc.system.name();
    const nodePeerId = await api.rpc.system.localPeerId();
    dispatch({type: 'SET_NODE_METADATA', connectedNodeMetadata: {
        name: nodeName.toString(),
        peerId: nodePeerId.toString(),
    }});
};

const LogionChainContext: Context<LogionChainContextType> = React.createContext<LogionChainContextType>(initState(DEFAULT_CONFIG));

function consumeEvents(state: LogionChainContextType, dispatch: React.Dispatch<Action>) {
    if(state.apiState === 'READY' && state.eventsConsumption === 'PENDING') {
        dispatch({type: 'START_EVENT_CONSUMPTION'});
    } else if(state.eventsConsumption === 'STARTING') {
        dispatch({type: 'EVENT_CONSUMPTION_STARTED'});
        state.api!.query.system.events(issuedEvents => {
            dispatch({type: 'NEW_EVENTS', newEvents: issuedEvents.toArray()});
        });
    }
}

function consumeHeaders(state: LogionChainContextType, dispatch: React.Dispatch<Action>) {
    if(state.apiState === 'READY' && state.eventsConsumption === 'PENDING') {
        dispatch({type: 'START_HEADER_CONSUMPTION'});
    } else if(state.headerConsumption === 'STARTING') {
        dispatch({type: 'HEADER_CONSUMPTION_STARTED'});
        state.api!.rpc.chain.subscribeNewHeads((lastHeader) => {
            dispatch({type: 'SET_LAST_HEADER', lastHeader});
        });
    }
}

async function consumeInjectedAccounts(state: LogionChainContextType, dispatch: React.Dispatch<Action>) {
    if(state.injectedAccountsConsumptionState === 'PENDING') {
        dispatch({type: 'INJECTED_ACCOUNTS_CONSUMPTION_STARTED'});
        const register = await enableExtensions(state.appName);
        dispatch({type: 'EXTENSIONS_ENABLED'});
        register((accounts: InjectedAccountWithMeta[]) => {
            dispatch({type: 'SET_INJECTED_ACCOUNTS', injectedAccounts: accounts});
        });
    }
}

interface LogionChainContextProviderProps {
    children: JSX.Element,
    config: ConfigType,
}

let keyringLoaded = false;

export function forceKeyringLoad() {
    keyringLoaded = false;
}

const LogionChainContextProvider = (props: LogionChainContextProviderProps): JSX.Element => {
    if(!keyringLoaded) {
        keyringLoaded = true;
        try {
            keyring.loadAll({ isDevelopment: props.config.DEVELOPMENT_KEYRING });
        } catch(error) {
            console.log("Keyring loadAll failed, already initialized?");
        }
    }

    const [state, dispatch] = useReducer(reducer, initState(props.config));
    state.selectedNode = props.config.availableNodes[0];
    state.connect = () => connect(state, dispatch);

    connect(state, dispatch);
    consumeEvents(state, dispatch);
    consumeHeaders(state, dispatch);
    consumeInjectedAccounts(state, dispatch);

    return <LogionChainContext.Provider value={state}>
        {props.children}
    </LogionChainContext.Provider>;
};

const useLogionChain = () => ({ ...useContext(LogionChainContext) });

export { LogionChainContextProvider, useLogionChain };
