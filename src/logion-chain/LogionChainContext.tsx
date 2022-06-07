import axios, { AxiosInstance } from 'axios';
import React, { useReducer, useContext, Context, Reducer, useEffect, useCallback } from 'react';
import { DateTime } from 'luxon';
import { ApiPromise } from '@polkadot/api';
import { buildApi } from '@logion/node-api';
import { AccountTokens, LegalOfficer, LogionClient } from '@logion/client';
import { enableExtensions, ExtensionSigner, InjectedAccount, isExtensionAvailable } from '@logion/extension';

import config, { Node } from '../config';
import Accounts, { buildAccounts } from '../common/types/Accounts';
import { clearAll, loadCurrentAddress, loadTokens, storeCurrentAddress, storeTokens } from '../common/Storage';

import { getEndpoints, NodeMetadata } from './Connection';
import { AxiosFactory } from '../common/api';

type ConsumptionStatus = 'PENDING' | 'STARTING' | 'STARTED';

export interface LogionChainContextType {
    api: ApiPromise | null,
    injectedAccountsConsumptionState: ConsumptionStatus
    injectedAccounts: InjectedAccount[] | null,
    edgeNodes: Node[],
    connectedNodeMetadata: NodeMetadata | null,
    extensionsEnabled: boolean,
    client: LogionClient | null,
    signer: ExtensionSigner | null,
    selectAddress: ((address: string) => void) | null,
    accounts: Accounts | null,
    logout: () => void,
    axiosFactory?: AxiosFactory,
    isCurrentAuthenticated: () => boolean,
    authenticate: (address: string[]) => Promise<void>,
    getOfficer?: (address: string | undefined) => LegalOfficer | undefined,
    saveOfficer?: (legalOfficer: LegalOfficer) => Promise<void>,
}

export interface FullLogionChainContextType extends LogionChainContextType {
    connecting: boolean,
    timer?: number,
    tokensToRefresh?: AccountTokens,
}

const initState = (): FullLogionChainContextType => ({
    api: null,
    injectedAccountsConsumptionState: 'PENDING',
    injectedAccounts: null,
    edgeNodes: config.edgeNodes,
    connectedNodeMetadata: null,
    extensionsEnabled: false,
    connecting: false,
    client: null,
    signer: null,
    selectAddress: null,
    accounts: null,
    logout: () => {},
    isCurrentAuthenticated: () => false,
    authenticate: (_: string[]) => Promise.reject(),
});

type ActionType = 'SET_SELECT_ADDRESS'
    | 'SELECT_ADDRESS'
    | 'CONNECT_INIT'
    | 'CONNECT_SUCCESS'
    | 'START_INJECTED_ACCOUNTS_CONSUMPTION'
    | 'INJECTED_ACCOUNTS_CONSUMPTION_STARTED'
    | 'SET_INJECTED_ACCOUNTS'
    | 'EXTENSIONS_ENABLED'
    | 'SET_LOGOUT'
    | 'LOGOUT'
    | 'SCHEDULE_TOKEN_REFRESH'
    | 'REFRESH_TOKENS'
    | 'START_TOKEN_REFRESH'
    | 'SET_AUTHENTICATE'
    | 'RESET_CLIENT'
;

interface Action {
    type: ActionType,
    api?: ApiPromise,
    error?: string,
    injectedAccounts?: InjectedAccount[],
    connectedNodeMetadata?: NodeMetadata,
    client?: LogionClient,
    signer?: ExtensionSigner,
    selectAddress?: ((address: string) => void),
    newAddress?: string,
    accounts?: Accounts,
    timer?: number;
    newTokens?: AccountTokens;
    logout?: () => void;
    logionClient?: LogionClient;
    authenticate?: (address: string[]) => Promise<void>;
}

function buildAxiosFactory(authenticatedClient?: LogionClient): AxiosFactory {
    if(authenticatedClient === undefined) {
        return () => axios.create();
    } else {
        return (owner?: string): AxiosInstance => {
            const legalOfficer = authenticatedClient.legalOfficers.find(legalOfficer => legalOfficer.address === owner)!;
            return authenticatedClient.buildAxios(legalOfficer);
        };
    }
}

const reducer: Reducer<FullLogionChainContextType, Action> = (state: FullLogionChainContextType, action: Action): FullLogionChainContextType => {
    switch (action.type) {
        case 'CONNECT_INIT':
            return { ...state, connecting: true };

        case 'CONNECT_SUCCESS':
            return {
                ...state,
                api: action.api!,
                client: action.client!,
                connectedNodeMetadata: action.connectedNodeMetadata!,
                ...buildClientHelpers(action.client!, state.injectedAccounts!),
            };

        case 'START_INJECTED_ACCOUNTS_CONSUMPTION':
            return { ...state, injectedAccountsConsumptionState: 'STARTING' };

        case 'INJECTED_ACCOUNTS_CONSUMPTION_STARTED':
            return { ...state, injectedAccountsConsumptionState: 'STARTED' };

        case 'SET_INJECTED_ACCOUNTS':
            return { ...state, injectedAccounts: action.injectedAccounts! };

        case 'EXTENSIONS_ENABLED':
            return { ...state, extensionsEnabled: true, signer: action.signer || null };

        case 'SET_SELECT_ADDRESS':
            return {
                ...state,
                selectAddress: action.selectAddress!
            };

        case 'SELECT_ADDRESS': {
            storeCurrentAddress(action.newAddress!);
            const client = state.client!.withCurrentAddress(action.newAddress!);
            return {
                ...state,
                client,
                ...buildClientHelpers(client, state.injectedAccounts!),
            };
        }

        case 'SET_LOGOUT':
            return {
                ...state,
                logout: action.logout!,
            };

        case 'LOGOUT': {
            clearAll();
            const client = state.client!.logout();
            clearInterval(state.timer!);
            return {
                ...state,
                client,
                timer: undefined,
                ...buildClientHelpers(client, state.injectedAccounts!),
            };
        }

        case 'SCHEDULE_TOKEN_REFRESH':
            if(state.timer === undefined) {
                return {
                    ...state,
                    timer: action.timer!
                };
            } else {
                clearInterval(action.timer!);
                return state;
            }

        case 'REFRESH_TOKENS':
            return {
                ...state,
                tokensToRefresh: state.client?.tokens
            }

        case 'START_TOKEN_REFRESH':
            return {
                ...state,
                tokensToRefresh: undefined,
            }

        case 'SET_AUTHENTICATE':
            return {
                ...state,
                authenticate: action.authenticate!,
            };

        case 'RESET_CLIENT':
            const client = action.client!;
            if(client === state.client) {
                return state;
            } else {
                storeTokens(client.tokens);
                if(client.currentAddress !== undefined && client.currentAddress !== state.accounts?.current?.address) {
                    storeCurrentAddress(client.currentAddress);
                }
                return {
                    ...state,
                    ...buildClientHelpers(client, state.injectedAccounts!),
                    client,
                }
            }

        default:
            /* istanbul ignore next */
            throw new Error(`Unknown type: ${action.type}`);
    }
};

function buildClientHelpers(client: LogionClient, injectedAccounts: InjectedAccount[]): {
    axiosFactory: AxiosFactory,
    isCurrentAuthenticated: () => boolean,
    getOfficer: (owner: string | undefined) => LegalOfficer | undefined,
    saveOfficer: (legalOfficer: LegalOfficer) => Promise<void>,
    accounts: Accounts,
} {
    return {
        axiosFactory: buildAxiosFactory(client),
        isCurrentAuthenticated: () => client.isTokenValid(DateTime.now()),
        getOfficer: address => client.legalOfficers.find(legalOfficer => legalOfficer.address === address),
        saveOfficer: legalOfficer => client.directoryClient.createOrUpdate(legalOfficer),
        accounts: buildAccounts(injectedAccounts!, client.currentAddress, client),
    }
}

const LogionChainContext: Context<FullLogionChainContextType> = React.createContext<FullLogionChainContextType>(initState());

async function consumeInjectedAccounts(state: LogionChainContextType, dispatch: React.Dispatch<Action>) {
    if(state.injectedAccountsConsumptionState === 'PENDING') {
        dispatch({type: 'START_INJECTED_ACCOUNTS_CONSUMPTION'});
    } else if(state.injectedAccountsConsumptionState === 'STARTING') {
        dispatch({type: 'INJECTED_ACCOUNTS_CONSUMPTION_STARTED'});
        const register = await enableExtensions(config.APP_NAME);
        if(isExtensionAvailable()) {
            dispatch({
                type: 'EXTENSIONS_ENABLED',
                signer: new ExtensionSigner()
            });
            register((accounts: InjectedAccount[]) => {
                dispatch({
                    type: 'SET_INJECTED_ACCOUNTS',
                    injectedAccounts: accounts
                });
            });
        } else {
            dispatch({
                type: 'EXTENSIONS_ENABLED',
            });
            dispatch({
                type: 'SET_INJECTED_ACCOUNTS',
                injectedAccounts: []
            });
        }
    }
}

interface LogionChainContextProviderProps {
    children: JSX.Element,
}

let timeout: NodeJS.Timeout | null = null;

const LogionChainContextProvider = (props: LogionChainContextProviderProps): JSX.Element => {
    const [state, dispatch] = useReducer(reducer, initState());

    if(timeout !== null) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(() => consumeInjectedAccounts(state, dispatch), 100);

    useEffect(() => {
        if(state.injectedAccounts !== null && state.client === null && !state.connecting) {
            dispatch({
                type: 'CONNECT_INIT'
            });

            (async function() {
                const rpcEndpoints = getEndpoints();
                const api = await buildApi(rpcEndpoints);
                const peerId = await api.rpc.system.localPeerId();
                const logionClient = await LogionClient.create({
                    rpcEndpoints,
                    directoryEndpoint: config.directory
                });

                const startupTokens = loadTokens().cleanUp(DateTime.now());
                let client = logionClient.useTokens(startupTokens);

                if(startupTokens.length > 0 && state.injectedAccounts!.length > 0) {
                    let candidates = [ loadCurrentAddress() || undefined, state.injectedAccounts![0].address ];
                    const now = DateTime.now();
                    let currentAddress = candidates.find(address => startupTokens.isAuthenticated(now, address));
                    if(currentAddress) {
                        client = client.withCurrentAddress(currentAddress);
                    }
                }

                dispatch({
                    type: 'CONNECT_SUCCESS',
                    api,
                    client,
                    logionClient,
                    connectedNodeMetadata: {
                        peerId : peerId.toString()
                    }
                });
            })();
        }
    }, [ state.injectedAccounts, state.client, state.connecting ]);

    const logout = useCallback(() => dispatch({
        type: 'LOGOUT',
    }), []);

    useEffect(() => {
        if(state.selectAddress === null && state.client !== null) {
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
    }, [ state ]);

    useEffect(() => {
        if(state.logout !== logout) {
            dispatch({
                type: 'SET_LOGOUT',
                logout,
            });
        }
    }, [ state, logout ]);

    useEffect(() => {
        if(state.client !== null
            && state.client.tokens.length > 0
            && state.timer === undefined) {
            const timeoutInS = 1;
            const timer = window.setInterval(() => {
                dispatch({
                    type: 'REFRESH_TOKENS'
                });
            }, timeoutInS * 1000);
            dispatch({
                type: 'SCHEDULE_TOKEN_REFRESH',
                timer
            });
        }
    }, [ state, dispatch ]);

    useEffect(() => {
        if(state.tokensToRefresh !== undefined
                && state.client !== null) {
            dispatch({
                type: 'START_TOKEN_REFRESH'
            });
            (async function() {
                const client = await state.client!.refreshTokens(DateTime.now(), {minutes: 30});
                dispatch({
                    type: 'RESET_CLIENT',
                    client,
                })
            })();
        }
    }, [ state.tokensToRefresh, dispatch, state.axiosFactory, state.client, state.accounts ]);

    const authenticateCallback = useCallback(async (addresses: string[]) => {
        if(!state.client || !state.signer) {
            return;
        }

        let client = await state.client.authenticate(addresses, state.signer);
        if(!client.currentAddress) {
            client = client.withCurrentAddress(addresses[0]);
        }
        dispatch({
            type: 'RESET_CLIENT',
            client,
        });
    }, [ state.client, state.signer ]);

    useEffect(() => {
        if(state.authenticate !== authenticateCallback) {
            dispatch({
                type: 'SET_AUTHENTICATE',
                authenticate: authenticateCallback
            });
        }
    }, [ state.authenticate, authenticateCallback ]);

    return <LogionChainContext.Provider value={state}>
        {props.children}
    </LogionChainContext.Provider>;
};

const useLogionChain = () => useContext(LogionChainContext);

export { LogionChainContextProvider, useLogionChain };
