import React, { useReducer, useContext, Context, Reducer } from 'react';

import { ConfigType, DEFAULT_CONFIG } from '../config';

import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import { ApiPromise, WsProvider } from '@polkadot/api';
import keyring from '@polkadot/ui-keyring';
import { EventRecord, Header, Extrinsic, Hash, Block } from '@polkadot/types/interfaces';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import { fetchExtrinsics, ExtrinsicsAndHead } from './Blocks';
import { enableAndConsumeInjectedAccounts } from './Keys';

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
    appName: string,
    socket: string,
    jsonrpc: any,
    types: any,
    api: ApiPromise | null,
    apiError: any,
    apiState: string | null,
    eventsConsumption: ConsumptionStatus,
    events: EventRecord[],
    headerConsumption: ConsumptionStatus,
    lastHeader: Header | null,
    fetchExtrinsics: ((specification: ExtrinsicFetchSpecification) => Promise<ExtrinsicsAndHead>) | null,
    injectedAccountsConsumptionState: ConsumptionStatus
    injectedAccounts: InjectedAccountWithMeta[],
}

const initState = (config: ConfigType): LogionChainContextType => ({
    appName: config.APP_NAME,
    socket: config.PROVIDER_SOCKET,
    jsonrpc: { ...jsonrpc, ...config.RPC },
    types: config.types,
    api: null,
    apiError: null,
    apiState: null,
    eventsConsumption: 'PENDING',
    events: [],
    headerConsumption: 'PENDING',
    lastHeader: null,
    fetchExtrinsics: null,
    injectedAccountsConsumptionState: 'PENDING',
    injectedAccounts: []
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
    | 'SET_INJECTED_ACCOUNTS';

interface Action {
    type: ActionType,
    api?: ApiPromise,
    error?: string,
    newEvents?: EventRecord[],
    lastHeader?: Header,
    injectedAccounts?: InjectedAccountWithMeta[]
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

        default:
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
    const { apiState, socket, jsonrpc, types } = state;
    // We only want this function to be performed once
    if (apiState) return;

    dispatch({ type: 'CONNECT_INIT' });

    const provider = new WsProvider(socket);
    const _api = new ApiPromise({ provider, types, rpc: jsonrpc });

    // Set listeners for disconnection and reconnection event.
    _api.on('connected', () => {
        dispatch({ type: 'CONNECT', api: _api });
        // `ready` event is not emitted upon reconnection and is checked explicitly here.
        _api.isReady.then((_api) => dispatch({ type: 'CONNECT_SUCCESS' }));
    });
    _api.on('ready', () => dispatch({ type: 'CONNECT_SUCCESS' }));
    _api.on('error', err => dispatch({ type: 'CONNECT_ERROR', error: err }));
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
        enableAndConsumeInjectedAccounts(state.appName, (accounts: InjectedAccountWithMeta[]) => {
            console.log(`Injected accounts updated: got ${accounts.length} accounts`);
            dispatch({type: 'SET_INJECTED_ACCOUNTS', injectedAccounts: accounts});
        })
    }
}

interface LogionChainContextProviderProps {
    children: JSX.Element,
    config: ConfigType,
}

let keyringLoaded = false;
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
