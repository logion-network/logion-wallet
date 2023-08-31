import { AccountTokens, LegalOfficer, LegalOfficerClass, LogionClient, DefaultSignAndSendStrategy, Token, RawSigner } from '@logion/client';
import { allMetamaskAccounts, enableExtensions, enableMetaMask, ExtensionSigner, InjectedAccount, isExtensionAvailable } from '@logion/extension';
import { buildApiClass, LogionNodeApiClass, ValidAccountId } from '@logion/node-api';
import axios, { AxiosInstance } from 'axios';
import React, { useReducer, useContext, Context, Reducer, useEffect, useCallback } from 'react';
import { DateTime } from 'luxon';

import config, { Node } from '../config';
import Accounts, { buildAccounts, toValidAccountId } from '../common/types/Accounts';
import { clearAll, loadCurrentAddress, loadTokens, storeCurrentAddress, storeTokens } from '../common/Storage';

import { getEndpoints, NodeMetadata } from './Connection';

type ConsumptionStatus = 'PENDING' | 'STARTING' | 'STARTED';

export const SIGN_AND_SEND_STRATEGY = new DefaultSignAndSendStrategy();

export type AxiosFactory = (legalOfficerAddress: string | undefined, token?: Token) => AxiosInstance;

export interface LogionChainContextType {
    api: LogionNodeApiClass | null,
    injectedAccountsConsumptionState: ConsumptionStatus
    injectedAccounts: InjectedAccount[] | null,
    metaMaskAccounts: InjectedAccount[] | null,
    edgeNodes: Node[],
    connectedNodeMetadata: NodeMetadata | null,
    extensionsEnabled: boolean,
    client: LogionClient | null,
    signer: ExtensionSigner | null,
    selectAddress: ((address: ValidAccountId) => void) | null,
    accounts: Accounts | null,
    logout: () => void,
    axiosFactory?: AxiosFactory,
    isCurrentAuthenticated: () => boolean,
    authenticate: (address: ValidAccountId[]) => Promise<void>,
    authenticateAddress: (address: ValidAccountId, signer?: RawSigner) => Promise<LogionClient | undefined>,
    getOfficer?: (address: string | undefined) => LegalOfficerClass | undefined,
    saveOfficer?: (legalOfficer: LegalOfficer) => Promise<void>,
    reconnect: () => void,
    tryEnableMetaMask: () => Promise<void>,
}

export interface FullLogionChainContextType extends LogionChainContextType {
    connecting: boolean,
    timer?: number,
    tokensToRefresh?: AccountTokens,
    registeredLegalOfficers?: Set<string>,
}

const initState = (): FullLogionChainContextType => ({
    api: null,
    injectedAccountsConsumptionState: 'PENDING',
    injectedAccounts: null,
    metaMaskAccounts: null,
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
    authenticate: (_: ValidAccountId[]) => Promise.reject(),
    authenticateAddress: (_: ValidAccountId) => Promise.reject(),
    reconnect: () => {},
    tryEnableMetaMask: async () => {},
});

type ActionType = 'SET_SELECT_ADDRESS'
    | 'SELECT_ADDRESS'
    | 'CONNECT_INIT'
    | 'CONNECT_SUCCESS'
    | 'START_INJECTED_ACCOUNTS_CONSUMPTION'
    | 'INJECTED_ACCOUNTS_CONSUMPTION_STARTED'
    | 'SET_INJECTED_ACCOUNTS'
    | 'SET_METAMASK_ACCOUNTS'
    | 'EXTENSIONS_ENABLED'
    | 'SET_LOGOUT'
    | 'LOGOUT'
    | 'SCHEDULE_TOKEN_REFRESH'
    | 'REFRESH_TOKENS'
    | 'START_TOKEN_REFRESH'
    | 'SET_AUTHENTICATE'
    | 'SET_AUTHENTICATE_ADDRESS'
    | 'RESET_CLIENT'
    | 'RECONNECT'
    | 'SET_RECONNECT'
    | 'SET_TRY_ENABLE_METAMASK'
;

interface Action {
    type: ActionType,
    api?: LogionNodeApiClass,
    error?: string,
    injectedAccounts?: InjectedAccount[],
    metaMaskAccounts?: InjectedAccount[],
    connectedNodeMetadata?: NodeMetadata,
    client?: LogionClient,
    signer?: ExtensionSigner,
    selectAddress?: ((address: ValidAccountId) => void),
    newAddress?: ValidAccountId,
    accounts?: Accounts,
    timer?: number;
    newTokens?: AccountTokens;
    logout?: () => void;
    logionClient?: LogionClient;
    authenticate?: (address: ValidAccountId[]) => Promise<void>;
    authenticateAddress?: (address: ValidAccountId) => Promise<LogionClient | undefined>;
    registeredLegalOfficers?: Set<string>;
    reconnect?: () => void;
    tryEnableMetaMask?: () => Promise<void>;
}

function buildAxiosFactory(authenticatedClient?: LogionClient): AxiosFactory {
    if(authenticatedClient === undefined) {
        return () => axios.create();
    } else {
        return (owner?: string, token?: Token): AxiosInstance => {
            const legalOfficer = authenticatedClient.legalOfficers.find(legalOfficer => legalOfficer.address === owner)!;
            const axios = authenticatedClient.buildAxios(legalOfficer);
            if (token) {
                axios.interceptors.request.use((config) => {
                    if (!config.headers) {
                        config.headers = {};
                    }
                    config.headers['Authorization'] = `Bearer ${ token.value }`;
                    return config;
                });
            }
            return axios;
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
                registeredLegalOfficers: action.registeredLegalOfficers,
                ...buildClientHelpers(action.client!, state.injectedAccounts || [], state.metaMaskAccounts || [], action.registeredLegalOfficers!),
            };

        case 'START_INJECTED_ACCOUNTS_CONSUMPTION':
            return { ...state, injectedAccountsConsumptionState: 'STARTING' };

        case 'INJECTED_ACCOUNTS_CONSUMPTION_STARTED':
            return { ...state, injectedAccountsConsumptionState: 'STARTED' };

        case 'SET_INJECTED_ACCOUNTS':
        case 'SET_METAMASK_ACCOUNTS': {
            let helpers = {};
            const injectedAccounts = action.injectedAccounts || state.injectedAccounts;
            const metaMaskAccounts = action.metaMaskAccounts || state.metaMaskAccounts;
            if(state.client && state.registeredLegalOfficers) {
                helpers = buildClientHelpers(state.client!, injectedAccounts || [], metaMaskAccounts || [], state.registeredLegalOfficers!);
            }
            return {
                ...state,
                injectedAccounts,
                metaMaskAccounts,
                ...helpers,
            };
        }
        case 'EXTENSIONS_ENABLED':
            return { ...state, extensionsEnabled: true, signer: action.signer || null };

        case 'SET_SELECT_ADDRESS':
            return {
                ...state,
                selectAddress: action.selectAddress!
            };

        case 'SELECT_ADDRESS': {
            storeCurrentAddress(state.client!.logionApi, action.newAddress!);
            const client = state.client!.withCurrentAddress(action.newAddress!);
            return {
                ...state,
                client,
                ...buildClientHelpers(client, state.injectedAccounts || [], state.metaMaskAccounts || [], state.registeredLegalOfficers!),
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
                ...buildClientHelpers(client, state.injectedAccounts || [], state.metaMaskAccounts || [], state.registeredLegalOfficers!),
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

        case 'SET_AUTHENTICATE_ADDRESS':
            return {
                ...state,
                authenticateAddress: action.authenticateAddress!,
            };

        case 'RESET_CLIENT':
            let client = action.client!;
            if(client === state.client) {
                return state;
            } else {
                storeTokens(client.tokens);
                if(client.currentAddress && !(state.accounts?.current?.accountId)) {
                    storeCurrentAddress(client.logionApi, client.currentAddress);
                } else if(state.accounts?.current?.accountId && state.accounts.current.accountId !== client.currentAddress) {
                    const clientWithCurrentAddress = client.withCurrentAddress(state.accounts.current.accountId);
                    if(clientWithCurrentAddress.isTokenValid(DateTime.now())) {
                        client = clientWithCurrentAddress;
                    } else if(client.currentAddress) {
                        storeCurrentAddress(client.logionApi, client.currentAddress);
                    }
                }
                return {
                    ...state,
                    ...buildClientHelpers(client, state.injectedAccounts || [], state.metaMaskAccounts || [], action.registeredLegalOfficers!),
                    client,
                }
            }
        case 'SET_RECONNECT':
            return {
                ...state,
                reconnect: action.reconnect!
            };
        case 'RECONNECT':
            return {
                ...state,
                client: null,
                api: null,
                connecting: false,
            }
        case 'SET_TRY_ENABLE_METAMASK':
            return {
                ...state,
                tryEnableMetaMask: action.tryEnableMetaMask!,
            };
        default:
            /* istanbul ignore next */
            throw new Error(`Unknown type: ${action.type}`);
    }
};

function buildClientHelpers(
    client: LogionClient,
    injectedAccounts: InjectedAccount[],
    metaMaskAccounts: InjectedAccount[],
    legalOfficers: Set<string>
): {
    axiosFactory: AxiosFactory,
    isCurrentAuthenticated: () => boolean,
    getOfficer: (owner: string | undefined) => LegalOfficerClass | undefined,
    saveOfficer: (legalOfficer: LegalOfficer) => Promise<void>,
    accounts: Accounts,
} {
    return {
        axiosFactory: buildAxiosFactory(client),
        isCurrentAuthenticated: () => client.isTokenValid(DateTime.now()),
        getOfficer: address => client.allLegalOfficers.find(legalOfficer => legalOfficer.address === address),
        saveOfficer: legalOfficer => client.directoryClient.createOrUpdate(legalOfficer),
        accounts: buildAccounts(metaMaskAccounts.concat(injectedAccounts), client.currentAddress, client, legalOfficers),
    }
}

const LogionChainContext: Context<FullLogionChainContextType> = React.createContext<FullLogionChainContextType>(initState());

async function consumeInjectedAccounts(state: LogionChainContextType, dispatch: React.Dispatch<Action>) {
    if(state.injectedAccountsConsumptionState === 'PENDING') {
        dispatch({type: 'START_INJECTED_ACCOUNTS_CONSUMPTION'});
    } else if(state.injectedAccountsConsumptionState === 'STARTING') {
        dispatch({type: 'INJECTED_ACCOUNTS_CONSUMPTION_STARTED'});

        if(isExtensionAvailable()) {
            const register = await enableExtensions(config.APP_NAME);
            dispatch({
                type: 'EXTENSIONS_ENABLED',
                signer: new ExtensionSigner(SIGN_AND_SEND_STRATEGY)
            });
            dispatch({
                type: 'SET_INJECTED_ACCOUNTS',
                injectedAccounts: [],
            });
            register((injectedAccounts: InjectedAccount[]) => {
                dispatch({
                    type: 'SET_INJECTED_ACCOUNTS',
                    injectedAccounts,
                });
            });
        } else {
            dispatch({
                type: 'EXTENSIONS_ENABLED',
            });
            dispatch({
                type: 'SET_INJECTED_ACCOUNTS',
                injectedAccounts: [],
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
                const api = await buildApiClass(rpcEndpoints);
                const peerId = await api.polkadot.rpc.system.localPeerId();
                const logionClient = await LogionClient.create({
                    rpcEndpoints,
                    directoryEndpoint: config.directory
                });

                let startupTokens: AccountTokens;
                try {
                    startupTokens = loadTokens(api).cleanUp(DateTime.now());
                } catch(e) {
                    startupTokens = new AccountTokens(api, {});
                }
                let client = logionClient.useTokens(startupTokens);

                if(startupTokens.length > 0 && state.injectedAccounts!.length > 0) {
                    let candidates = [ loadCurrentAddress(api) || undefined, toValidAccountId(api, state.injectedAccounts![0]) ];
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
                    },
                    registeredLegalOfficers: await buildLegalOfficersSet(client, state.injectedAccounts!),
                });
            })();
        }
    }, [ state.injectedAccounts, state.client, state.connecting ]);

    const selectAddressCallback = useCallback((address: ValidAccountId) => {
        dispatch({
            type: 'SELECT_ADDRESS',
            newAddress: address,
        })
    }, []);

    useEffect(() => {
        if(state.selectAddress !== selectAddressCallback) {
            dispatch({
                type: 'SET_SELECT_ADDRESS',
                selectAddress: selectAddressCallback,
            });
        }
    }, [ state, selectAddressCallback ]);

    const logout = useCallback(() => dispatch({
        type: 'LOGOUT',
    }), []);

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
            }, timeoutInS * 10000);
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
                    registeredLegalOfficers: await buildLegalOfficersSet(client, state.injectedAccounts!),
                })
            })();
        }
    }, [ state.tokensToRefresh, dispatch, state.axiosFactory, state.client, state.accounts, state.injectedAccounts ]);

    const authenticateCallback = useCallback(async (addresses: ValidAccountId[]) => {
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
            registeredLegalOfficers: await buildLegalOfficersSet(client, state.injectedAccounts!),
        });
    }, [ state.client, state.signer, state.injectedAccounts ]);

    const authenticateAddressCallback = useCallback(async (address: ValidAccountId, signer?: RawSigner) => {
        if(!state.client || !state.signer) {
            return undefined;
        }
        let client = await state.client.authenticate([ address ], signer ? signer : state.signer);
        client = client.withCurrentAddress(address);
        dispatch({
            type: 'RESET_CLIENT',
            client,
            registeredLegalOfficers: await buildLegalOfficersSet(client, state.injectedAccounts!),
        });
        return client;
    }, [ state.client, state.signer, state.injectedAccounts ]);

    useEffect(() => {
        if(state.authenticate !== authenticateCallback) {
            dispatch({
                type: 'SET_AUTHENTICATE',
                authenticate: authenticateCallback
            });
        }
    }, [ state.authenticate, authenticateCallback ]);

    useEffect(() => {
        if(state.authenticateAddress !== authenticateAddressCallback) {
            dispatch({
                type: 'SET_AUTHENTICATE_ADDRESS',
                authenticateAddress: authenticateAddressCallback
            });
        }
    }, [ state.authenticateAddress, authenticateAddressCallback ]);

    const reconnect = useCallback(() => dispatch({
        type: 'RECONNECT',
    }), []);

    useEffect(() => {
        if(state.reconnect !== reconnect) {
            dispatch({
                type: 'SET_RECONNECT',
                reconnect,
            });
        }
    }, [ state, reconnect ]);

    const tryEnableMetaMask = useCallback(async () => {
        if(state.metaMaskAccounts === null) {
            dispatch({
                type: 'SET_METAMASK_ACCOUNTS',
                metaMaskAccounts: [],
            });
    
            const metaMaskEnabled = await enableMetaMask(config.APP_NAME);
            if(metaMaskEnabled) {
                const metaMaskAccounts = await allMetamaskAccounts();
                dispatch({
                    type: 'SET_METAMASK_ACCOUNTS',
                    metaMaskAccounts,
                });
            }
        }
    }, [ state.metaMaskAccounts ]);

    useEffect(() => {
        if(state.tryEnableMetaMask !== tryEnableMetaMask) {
            dispatch({
                type: 'SET_TRY_ENABLE_METAMASK',
                tryEnableMetaMask,
            });
        }
    }, [ state.tryEnableMetaMask, tryEnableMetaMask ]);

    return <LogionChainContext.Provider value={state}>
        {props.children}
    </LogionChainContext.Provider>;
};

async function buildLegalOfficersSet(client: LogionClient, accounts: InjectedAccount[]): Promise<Set<string>> {
    const legalOfficersSet = new Set<string>();
    for(const account of accounts) {
        if(account.type !== "ethereum" && account.type !== "ecdsa" && await client.isRegisteredLegalOfficer(account.address)) {
            legalOfficersSet.add(account.address);
        }
    }
    return legalOfficersSet;
}

const useLogionChain = () => useContext(LogionChainContext);

export { LogionChainContextProvider, useLogionChain };
