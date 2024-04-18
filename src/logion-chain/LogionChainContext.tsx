import {
    AccountTokens,
    LegalOfficer,
    LegalOfficerClass,
    LogionClient,
    Token,
    RawSigner,
    ISubmittableResult,
    SignAndSendStrategy,
} from '@logion/client';
import {
    allMetamaskAccounts,
    getAccounts,
    enableMetaMask,
    ExtensionSigner,
    InjectedAccount,
    isExtensionAvailable
} from '@logion/extension';
import { LogionNodeApiClass, ValidAccountId, UUID } from '@logion/node-api';
import axios, { AxiosInstance, AxiosHeaders } from 'axios';
import React, { useReducer, useContext, Context, Reducer, useEffect, useCallback } from 'react';
import { DateTime } from 'luxon';

import config from '../config';
import Accounts, { buildAccounts, toValidAccountId } from '../common/types/Accounts';
import {
    clearAll,
    clearCurrentAddress,
    loadCurrentAddress,
    loadTokens,
    storeCurrentAddress,
    storeTokens
} from '../common/Storage';

import { NodeMetadata } from './Connection';
import { BrowserAxiosFileUploader, newLogionClient } from '@logion/client-browser';

type ConsumptionStatus = 'PENDING' | 'STARTING' | 'STARTED';

class FrontendSignAndSendStrategy implements SignAndSendStrategy {

    canUnsub(result: ISubmittableResult): boolean {
        return result.isInBlock;
    }
}
export const SIGN_AND_SEND_STRATEGY = new FrontendSignAndSendStrategy();

export function isSuccessful(result: ISubmittableResult): boolean {
    return result.dispatchError === undefined && SIGN_AND_SEND_STRATEGY.canUnsub(result);
}

export type AxiosFactory = (legalOfficerAddress: ValidAccountId | undefined, token?: Token) => AxiosInstance;

export type CallCallback = (result: ISubmittableResult) => void;

export type Call = (callback: CallCallback) => Promise<void>;

export type SignAndSubmit = ((setResult: (result: ISubmittableResult | null) => void, setError: (error: unknown) => void) => void) | null;

export type CallBatchJobs = { submissionId: string, call: Call }[];

export class CallBatch {

    static readonly DEFAULT_SUBMISSION_ID = "__DEFAULT__";

    static fromSingle(call: Call) {
        return CallBatch.fromSingleWithId(CallBatch.DEFAULT_SUBMISSION_ID, call);
    }

    static fromSingleWithId(submissionId: string, call: Call) {
        return new CallBatch([ { submissionId, call } ]);
    }

    constructor(jobs: CallBatchJobs) {
        this.ensureIdUnicity(jobs);
        this.jobs = jobs;
    }

    private ensureIdUnicity(jobs: CallBatchJobs) {
        const set = new Set();
        jobs.forEach(job => set.add(job.submissionId));
        if(set.size !== jobs.length) {
            throw new Error("Unicity constraint on submission IDs is not met");
        }
    }

    readonly jobs: CallBatchJobs;
}

export class ExtrinsicSubmissionState {

    constructor() {
        this._result = {};
        this._error = {};
        this._submitted = {};
        this._callEnded = {};
        this._submissions = 0;
    }

    private _result: Record<string, ISubmittableResult | null>;
    private _error: Record<string, any>;
    private _submitted: Record<string, boolean>;
    private _callEnded: Record<string, boolean>;
    private _submissions: number;

    canSubmit() {
        return !this.submitted || this.callEnded;
    }

    get submitted() {
        return Object.keys(this._submitted).length > 0;
    }

    get callEnded() { // All submissions completed
        return Object.keys(this._callEnded).length === this._submissions;
    }

    get inProgress() {
        return this.submitted && !this.callEnded;
    }

    get result() { // Convenience property for single job submissions
        return this.getResult();
    }

    getResult(submissionId?: string) {
        return this._result[submissionId || CallBatch.DEFAULT_SUBMISSION_ID] || null;
    }

    get error() { // Convenience property for single job submissions
        return this.getError();
    }

    getError(submissionId?: string) {
        return this._error[submissionId || CallBatch.DEFAULT_SUBMISSION_ID] || null;
    }

    isInProgress(submissionId?: string) {
        return this.isSubmitted(submissionId) && !this.hasEnded(submissionId);
    }

    isSubmitted(submissionId?: string) {
        return this._submitted[submissionId || CallBatch.DEFAULT_SUBMISSION_ID] || false;
    }

    hasEnded(submissionId?: string) {
        return this._callEnded[submissionId || CallBatch.DEFAULT_SUBMISSION_ID] || false;
    }

    submit(submissions: number) {
        if(!submissions) {
            throw new Error("Cannot submit nothing");
        }
        if(!this.canSubmit()) {
            throw new Error("Cannot submit new call");
        }
        const state = new ExtrinsicSubmissionState();
        state._result = {};
        state._error = {};
        state._submitted = {};
        state._callEnded = {};
        state._submissions = submissions;
        return state;
    }

    start(submissionId: string) {
        if(this._submitted[submissionId]) {
            throw new Error("Call already started");
        }
        const state = new ExtrinsicSubmissionState();
        state._submitted = {
            ...this._submitted,
            [ submissionId ]: true,
        };
        state._result = this._result;
        state._error = this._error;
        state._callEnded = this._callEnded;
        state._submissions = this._submissions;
        return state;
    }

    withResult(callId: string, result: ISubmittableResult) {
        if(this._callEnded[callId]) {
            throw new Error("Call already ended");
        }
        const state = new ExtrinsicSubmissionState();
        state._result = {
            ...this._result,
            [ callId ]: result,
        };
        state._error = this._error;
        state._submitted = this._submitted;
        state._callEnded = this._callEnded;
        state._submissions = this._submissions;
        return state;
    }

    end(submissionId: string, error: unknown) {
        if(this._callEnded[submissionId]) {
            throw new Error("Call already ended");
        }
        const state = new ExtrinsicSubmissionState();
        state._result = this._result;
        state._error = {
            ...this._error,
            [ submissionId ]: error,
        }
        state._submitted = this._submitted;
        state._callEnded = {
            ...this._callEnded,
            [ submissionId ]: true,
        };
        state._submissions = this._submissions;
        return state;
    }

    isSuccessful(submissionId?: string): boolean {
        const error = this._error[submissionId || CallBatch.DEFAULT_SUBMISSION_ID];
        return this._callEnded[submissionId || CallBatch.DEFAULT_SUBMISSION_ID] && error === undefined;
    }

    isError(submissionId?: string): boolean {
        const error = this._error[submissionId || CallBatch.DEFAULT_SUBMISSION_ID];
        return this._callEnded[submissionId || CallBatch.DEFAULT_SUBMISSION_ID] && error !== undefined;
    }

    resetAndKeepResult() {
        if(!this.callEnded) {
            throw new Error("Call not yet ended");
        }
        const state = new ExtrinsicSubmissionState();
        state._result = this._result;
        state._error = this._error;
        state._submitted = {};
        state._callEnded = {};
        state._submissions = 0;
        return state;
    }
}

export interface LogionChainContextType {
    api: LogionNodeApiClass | null,
    injectedAccountsConsumptionState: ConsumptionStatus
    injectedAccounts: InjectedAccount[] | null,
    metaMaskAccounts: InjectedAccount[] | null,
    allAccounts: InjectedAccount[] | null,
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
    getOfficer?: (address: ValidAccountId | undefined) => LegalOfficerClass | undefined,
    saveOfficer?: (legalOfficer: LegalOfficer) => Promise<void>,
    reconnect: () => void,
    tryEnableMetaMask: () => Promise<void>,
    extrinsicSubmissionState: ExtrinsicSubmissionState;
    submitCall: (call: Call) => Promise<void>;
    submitCallBatch: (batch: CallBatch) => Promise<Record<string, unknown>>;
    submitSignAndSubmit: (signAndSubmit: SignAndSubmit) => void;
    resetSubmissionState: () => void;
    clearSubmissionState: () => void;
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
    allAccounts: null,
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
    extrinsicSubmissionState: new ExtrinsicSubmissionState(),
    submitCall: () => Promise.reject(),
    submitCallBatch: () => Promise.reject(),
    submitSignAndSubmit: () => {},
    resetSubmissionState: () => {},
    clearSubmissionState: () => {},
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
    | 'SET_SUBMIT_CALL'
    | 'SUBMIT_EXTRINSIC'
    | 'SET_SUBMITTABLE_RESULT'
    | 'SET_SUBMISSION_ENDED'
    | 'SET_SUBMIT_SIGN_AND_SUBMIT'
    | 'SET_RESET_SUBMISSION_STATE'
    | 'RESET_SUBMISSION_STATE'
    | 'SET_CLEAR_SUBMISSION_STATE'
    | 'CLEAR_SUBMISSION_STATE'
    | 'SET_SUBMIT_CALL_BATCH'
    | 'SET_SUBMISSION_STARTED'
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
    submitCall?: (call: Call) => Promise<void>;
    result?: ISubmittableResult | null;
    extrinsicSubmissionError?: unknown;
    submitSignAndSubmit?: (signAndSubmit: SignAndSubmit) => void;
    resetSubmissionState?: () => void;
    clearSubmissionState?: () => void;
    submissions?: number;
    submissionId?: string;
    submitCallBatch?: (batch: CallBatch) => Promise<Record<string, unknown>>;
}

function buildAxiosFactory(authenticatedClient?: LogionClient): AxiosFactory {
    if(authenticatedClient === undefined) {
        return () => axios.create();
    } else {
        return (owner?: ValidAccountId, token?: Token): AxiosInstance => {
            const legalOfficer = authenticatedClient.legalOfficers.find(legalOfficer => legalOfficer.account.equals(owner))!;
            const axios = legalOfficer.buildAxiosToNode();
            if (token) {
                axios.interceptors.request.use((config) => {
                    if (!config.headers) {
                        config.headers = new AxiosHeaders();
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

        case 'CONNECT_SUCCESS': {
            const partialState = buildClientHelpers(action.client!, state.allAccounts || [], action.registeredLegalOfficers!);
            if(state.client && partialState.accounts.current) {
                storeCurrentAddress(partialState.accounts.current.accountId);
            }
            return {
                ...state,
                api: action.api!,
                connectedNodeMetadata: action.connectedNodeMetadata!,
                registeredLegalOfficers: action.registeredLegalOfficers,
                ...partialState,
            };
        }
        case 'START_INJECTED_ACCOUNTS_CONSUMPTION':
            return { ...state, injectedAccountsConsumptionState: 'STARTING' };

        case 'INJECTED_ACCOUNTS_CONSUMPTION_STARTED':
            return { ...state, injectedAccountsConsumptionState: 'STARTED' };

        case 'SET_INJECTED_ACCOUNTS':
        case 'SET_METAMASK_ACCOUNTS': {
            let partialStateOrEmpty = {};
            const injectedAccounts = action.injectedAccounts || state.injectedAccounts;
            const metaMaskAccounts = action.metaMaskAccounts || state.metaMaskAccounts;
            const allAccounts = injectedAccounts === null && metaMaskAccounts === null ? null : (metaMaskAccounts || []).concat(injectedAccounts || []);
            const registeredLegalOfficers = action.registeredLegalOfficers || state.registeredLegalOfficers;
            if(state.client) {
                const partialState = buildClientHelpers(state.client, allAccounts || [], registeredLegalOfficers || new Set());
                if(partialState.accounts.current) {
                    storeCurrentAddress(partialState.accounts.current.accountId);
                }
                partialStateOrEmpty = partialState;
            }
            return {
                ...state,
                injectedAccounts,
                metaMaskAccounts,
                allAccounts,
                registeredLegalOfficers,
                ...partialStateOrEmpty,
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
            storeCurrentAddress(action.newAddress!);
            const client = state.client!.withCurrentAccount(action.newAddress!);
            return {
                ...state,
                ...buildClientHelpers(client, state.allAccounts || [], state.registeredLegalOfficers!),
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
            clearCurrentAddress();
            return {
                ...state,
                timer: undefined,
                ...buildClientHelpers(client, state.allAccounts || [], state.registeredLegalOfficers!),
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
                const partialState = buildClientHelpers(client, state.allAccounts || [], action.registeredLegalOfficers!);
                if(state.client && partialState.accounts.current) {
                    storeCurrentAddress(partialState.accounts.current.accountId);
                }
                return {
                    ...state,
                    ...partialState,
                    registeredLegalOfficers: action.registeredLegalOfficers!,
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
        case 'SET_SUBMIT_CALL':
            return {
                ...state,
                submitCall: action.submitCall!,
            };
        case 'SUBMIT_EXTRINSIC':
            if(state.extrinsicSubmissionState.canSubmit()) {
                return {
                    ...state,
                    extrinsicSubmissionState: state.extrinsicSubmissionState.submit(action.submissions!),
                };
            } else {
                return state;
            }
        case 'SET_SUBMISSION_STARTED':
            return {
                ...state,
                extrinsicSubmissionState: state.extrinsicSubmissionState.start(action.submissionId!),
            };
        case 'SET_SUBMITTABLE_RESULT':
            return {
                ...state,
                extrinsicSubmissionState: state.extrinsicSubmissionState.withResult(action.submissionId!, action.result!),
            };
        case 'SET_SUBMISSION_ENDED':
            return {
                ...state,
                extrinsicSubmissionState: state.extrinsicSubmissionState.end(action.submissionId!, action.extrinsicSubmissionError || null),
            };
        case 'SET_SUBMIT_SIGN_AND_SUBMIT':
            return {
                ...state,
                submitSignAndSubmit: action.submitSignAndSubmit!,
            };
        case 'SET_RESET_SUBMISSION_STATE':
            return {
                ...state,
                resetSubmissionState: action.resetSubmissionState!,
            };
        case 'RESET_SUBMISSION_STATE':
            return {
                ...state,
                extrinsicSubmissionState: state.extrinsicSubmissionState.resetAndKeepResult(),
            };
        case 'SET_CLEAR_SUBMISSION_STATE':
            return {
                ...state,
                clearSubmissionState: action.clearSubmissionState!,
            };
        case 'CLEAR_SUBMISSION_STATE':
            return {
                ...state,
                extrinsicSubmissionState: new ExtrinsicSubmissionState(),
            };
        case 'SET_SUBMIT_CALL_BATCH':
            return {
                ...state,
                submitCallBatch: action.submitCallBatch!,
            };
        default:
            /* istanbul ignore next */
            throw new Error(`Unknown type: ${action.type}`);
    }
};

function buildClientHelpers(
    client: LogionClient,
    allAccounts: InjectedAccount[],
    legalOfficers: Set<string>,
): {
    axiosFactory: AxiosFactory,
    isCurrentAuthenticated: () => boolean,
    getOfficer: (owner: ValidAccountId | undefined) => LegalOfficerClass | undefined,
    saveOfficer: (legalOfficer: LegalOfficer) => Promise<void>,
    accounts: Accounts,
    client: LogionClient,
} {
    const accounts = buildAccounts(allAccounts, client.currentAccount, client, legalOfficers);
    let updatedClient = client;
    if(accounts.current && (!client.currentAccount || !accounts.current?.accountId.equals(client.currentAccount))) {
        updatedClient = client.withCurrentAccount(accounts.current.accountId);
    }
    return {
        axiosFactory: buildAxiosFactory(client),
        isCurrentAuthenticated: () => client.isTokenValid(DateTime.now()),
        getOfficer: accountId => client.allLegalOfficers.find(legalOfficer => legalOfficer.account.equals(accountId)),
        saveOfficer: legalOfficer => client.directoryClient.createOrUpdate(legalOfficer),
        accounts,
        client: updatedClient,
    }
}

const LogionChainContext: Context<FullLogionChainContextType> = React.createContext<FullLogionChainContextType>(initState());

async function consumeInjectedAccounts(state: LogionChainContextType, dispatch: React.Dispatch<Action>) {
    if(state.injectedAccountsConsumptionState === 'PENDING') {
        dispatch({type: 'START_INJECTED_ACCOUNTS_CONSUMPTION'});
    } else if(state.injectedAccountsConsumptionState === 'STARTING') {
        dispatch({type: 'INJECTED_ACCOUNTS_CONSUMPTION_STARTED'});

        if(await isExtensionAvailable(config.APP_NAME)) {
            dispatch({
                type: 'EXTENSIONS_ENABLED',
                signer: new ExtensionSigner(SIGN_AND_SEND_STRATEGY)
            });
            (async function() {
                let registeredLegalOfficers = new Set<string>();
                const injectedAccounts = await getAccounts(config.APP_NAME, [ "polkadot-js", "subwallet-js" ]);
                if(state.client) {
                    registeredLegalOfficers = await buildLegalOfficersSet(state.client!, injectedAccounts);
                }
                dispatch({
                    type: 'SET_INJECTED_ACCOUNTS',
                    injectedAccounts,
                    registeredLegalOfficers,
                });
            })();
        } else {
            dispatch({
                type: 'EXTENSIONS_ENABLED',
            });
            dispatch({
                type: 'SET_INJECTED_ACCOUNTS',
                injectedAccounts: [],
                registeredLegalOfficers: new Set(),
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
        if(state.allAccounts !== null && state.client === null && !state.connecting) {
            dispatch({
                type: 'CONNECT_INIT'
            });

            const accounts = state.allAccounts;
            let logionClient: LogionClient;
            (async function() {
                if (config.environment) {
                    logionClient = await newLogionClient(config.environment);
                } else {
                    logionClient = await LogionClient.create({
                        rpcEndpoints: config.rpcEndpoints,
                        directoryEndpoint: config.directory,
                        buildFileUploader: () => new BrowserAxiosFileUploader(),
                        logionClassificationLoc: UUID.fromAnyString(config.logionClassification),
                        creativeCommonsLoc: UUID.fromAnyString(config.creativeCommons),
                    });
                }

                const api = logionClient.logionApi;
                const peerId = await api.polkadot.rpc.system.localPeerId();

                let startupTokens: AccountTokens;
                try {
                    startupTokens = loadTokens(api).cleanUp(DateTime.now());
                } catch(e) {
                    startupTokens = new AccountTokens(api, {});
                }
                let client = logionClient.useTokens(startupTokens);

                if(startupTokens.length > 0 && accounts.length > 0) {
                    let candidates = [ loadCurrentAddress() || undefined, toValidAccountId(api, accounts[0]) ];
                    const now = DateTime.now();
                    let currentAddress = candidates.find(address => startupTokens.isAuthenticated(now, address));
                    if(currentAddress) {
                        client = client.withCurrentAccount(currentAddress);
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
                    registeredLegalOfficers: await buildLegalOfficersSet(client, accounts),
                });
            })();
        }
    }, [ state.allAccounts, state.client, state.connecting ]);

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
                    registeredLegalOfficers: await buildLegalOfficersSet(client, state.allAccounts!),
                })
            })();
        }
    }, [ state.tokensToRefresh, dispatch, state.axiosFactory, state.client, state.accounts, state.allAccounts ]);

    const authenticateCallback = useCallback(async (addresses: ValidAccountId[]) => {
        if(!state.client || !state.signer) {
            return;
        }

        let client = await state.client.authenticate(addresses, state.signer);
        if(!client.currentAccount) {
            client = client.withCurrentAccount(addresses[0]);
        }
        dispatch({
            type: 'RESET_CLIENT',
            client,
            registeredLegalOfficers: await buildLegalOfficersSet(client, state.allAccounts!),
        });
    }, [ state.client, state.signer, state.allAccounts ]);

    const authenticateAddressCallback = useCallback(async (address: ValidAccountId, signer?: RawSigner) => {
        if(!state.client || !state.signer) {
            return undefined;
        }
        let client = await state.client.authenticate([ address ], signer ? signer : state.signer);
        client = client.withCurrentAccount(address);
        dispatch({
            type: 'RESET_CLIENT',
            client,
            registeredLegalOfficers: await buildLegalOfficersSet(client, state.allAccounts!),
        });
        return client;
    }, [ state.client, state.signer, state.allAccounts ]);

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

            if(!state.signer) {
                dispatch({
                    type: 'EXTENSIONS_ENABLED',
                    signer: new ExtensionSigner(SIGN_AND_SEND_STRATEGY)
                });
            }
        }
    }, [ state.metaMaskAccounts, state.signer ]);

    useEffect(() => {
        if(state.tryEnableMetaMask !== tryEnableMetaMask) {
            dispatch({
                type: 'SET_TRY_ENABLE_METAMASK',
                tryEnableMetaMask,
            });
        }
    }, [ state.tryEnableMetaMask, tryEnableMetaMask ]);

    const submitCallBatch = useCallback(async (batch: CallBatch) => {
        if(state.extrinsicSubmissionState.canSubmit()) {
            dispatch({
                type: 'SUBMIT_EXTRINSIC',
                submissions: batch.jobs.length,
            });
            let errorMap: Record<string, unknown> = {};
            for(const job of batch.jobs) {
                try {
                    dispatch({
                        type: 'SET_SUBMISSION_STARTED',
                        submissionId: job.submissionId,
                    });
                    await job.call((callbackResult: ISubmittableResult) => dispatch({
                        type: 'SET_SUBMITTABLE_RESULT',
                        result: callbackResult,
                        submissionId: job.submissionId,
                    }));
                    dispatch({
                        type: 'SET_SUBMISSION_ENDED',
                        submissionId: job.submissionId,
                    });
                } catch(e) {
                    console.log(e);
                    dispatch({
                        type: 'SET_SUBMISSION_ENDED',
                        extrinsicSubmissionError: e,
                        submissionId: job.submissionId,
                    });
                    errorMap[job.submissionId] = e;
                }
            }
            return errorMap;
        } else {
            let errorMap: Record<string, unknown> = {};
            for(const job of batch.jobs) {
                errorMap[job.submissionId] = "Could not submit";
            }
            return errorMap;
        }
    }, [ state.extrinsicSubmissionState ]);

    useEffect(() => {
        if(state.submitCallBatch !== submitCallBatch) {
            dispatch({
                type: 'SET_SUBMIT_CALL_BATCH',
                submitCallBatch,
            });
        }
    }, [ state.submitCallBatch, submitCallBatch ]);

    const submitCall = useCallback(async (call: Call) => {
        const errors = await submitCallBatch(CallBatch.fromSingle(call));
        if(errors[CallBatch.DEFAULT_SUBMISSION_ID]) {
            throw errors[CallBatch.DEFAULT_SUBMISSION_ID];
        }
    }, [ submitCallBatch ]);

    useEffect(() => {
        if(state.submitCall !== submitCall) {
            dispatch({
                type: 'SET_SUBMIT_CALL',
                submitCall,
            });
        }
    }, [ state.submitCall, submitCall ]);

    const submitSignAndSubmit = useCallback((signAndSubmit: SignAndSubmit) => {
        if(signAndSubmit && state.extrinsicSubmissionState.canSubmit()) {
            dispatch({
                type: 'SUBMIT_EXTRINSIC',
            });
            signAndSubmit(
                (result) => {
                    if(result !== null) {
                        dispatch({ type: "SET_SUBMITTABLE_RESULT", result });
                        if(isSuccessful(result)) {
                            dispatch({ type: "SET_SUBMISSION_ENDED" });
                        }
                    }
                },
                (extrinsicSubmissionError) => dispatch({ type: "SET_SUBMISSION_ENDED", extrinsicSubmissionError }),
            );
        }
    }, [ state.extrinsicSubmissionState ]);

    useEffect(() => {
        if(state.submitSignAndSubmit !== submitSignAndSubmit) {
            dispatch({
                type: 'SET_SUBMIT_SIGN_AND_SUBMIT',
                submitSignAndSubmit,
            });
        }
    }, [ state.submitSignAndSubmit, submitSignAndSubmit ]);

    const resetSubmissionState = useCallback(() => {
        dispatch({ type: 'RESET_SUBMISSION_STATE' });
    }, [ ]);

    useEffect(() => {
        if(state.resetSubmissionState !== resetSubmissionState) {
            dispatch({
                type: 'SET_RESET_SUBMISSION_STATE',
                resetSubmissionState,
            });
        }
    }, [ state.resetSubmissionState, resetSubmissionState ]);

    const clearSubmissionState = useCallback(() => {
        dispatch({ type: 'CLEAR_SUBMISSION_STATE' });
    }, [ ]);

    useEffect(() => {
        if(state.clearSubmissionState !== clearSubmissionState) {
            dispatch({
                type: 'SET_CLEAR_SUBMISSION_STATE',
                clearSubmissionState,
            });
        }
    }, [ state.clearSubmissionState, clearSubmissionState ]);

    return <LogionChainContext.Provider value={state}>
        {props.children}
    </LogionChainContext.Provider>;
};

async function buildLegalOfficersSet(client: LogionClient, accounts: InjectedAccount[]): Promise<Set<string>> {
    const legalOfficersSet = new Set<string>();
    for(const account of accounts) {
        if(account.type !== "ethereum" && account.type !== "ecdsa" && await client.isRegisteredLegalOfficer(ValidAccountId.polkadot(account.address))) {
            legalOfficersSet.add(account.address);
        }
    }
    return legalOfficersSet;
}

const useLogionChain = () => useContext(LogionChainContext);

export { LogionChainContextProvider, useLogionChain };
