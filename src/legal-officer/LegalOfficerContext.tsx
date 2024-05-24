import React, { useContext, useEffect, useReducer, Reducer, useCallback, useMemo } from 'react';
import { AxiosInstance } from 'axios';
import {
    VaultTransferRequest,
    LegalOfficer,
    LocsState,
    Votes,
    PendingRecoveryRequest,
    ReviewedRecoveryRequest,
} from '@logion/client';
import { LocType, LegalOfficerData, ValidAccountId } from "@logion/node-api";

import { useCommonContext } from '../common/CommonContext';
import { LIGHT_MODE } from './Types';
import { useLogionChain } from '../logion-chain';
import { VaultApi } from '../vault/VaultApi';
import { DateTime } from "luxon";
import { fetchAllLocsParams } from 'src/loc/LegalOfficerLocContext';
import { Locs, getLocsMap } from 'src/loc/Locs';

export const SETTINGS_KEYS = [ 'oath' ];

export type SettingId = typeof SETTINGS_KEYS[number];

export const SETTINGS_DESCRIPTION: Record<SettingId, string> = {
    oath: "Statement of facts: oath text"
};

const DEFAULT_NOOP = () => Promise.resolve();

export interface MissingSettings {
    directory: boolean;
    nodeId: boolean;
    baseUrl: boolean;
    region: boolean;
}

export interface LegalOfficerContext {
    refreshRequests: ((clearBeforeRefresh: boolean) => void);
    locsState: LocsState | null;
    pendingRecoveryRequests: PendingRecoveryRequest[] | null;
    recoveryRequestsHistory: ReviewedRecoveryRequest[] | null;
    axios?: AxiosInstance;
    pendingVaultTransferRequests?: VaultTransferRequest[];
    vaultTransferRequestsHistory?: VaultTransferRequest[];
    settings?: Record<string, string>;
    onchainSettings?: LegalOfficerData;
    updateSetting: (id: SettingId, value: string) => Promise<void>;
    missingSettings?: MissingSettings;
    refreshLocs: (newLocsState?: LocsState) => Promise<void>;
    refreshOnchainSettings: () => void;
    legalOfficer?: LegalOfficer;
    refreshLegalOfficer: () => void;
    reconnected: boolean;
    votes: Votes | null;
    refreshVotes: () => Promise<void>;
    mutateVotes: (mutator: (current: Votes) => Promise<Votes>) => Promise<void>;
    mutateLocsState: (mutator: (current: LocsState) => Promise<LocsState>) => Promise<void>;
    locs: Record<LocType, Locs>;
}

interface FullLegalOfficerContext extends LegalOfficerContext {
    dataAddress: ValidAccountId | null;
    callRefreshLocs: boolean;
    callRefreshRequests: boolean;
    callRefreshSettings: boolean;
    callRefreshLegalOfficer: boolean;
    callRefreshVotes: boolean;
}

function initialContextValue(): FullLegalOfficerContext {
    return {
        dataAddress: null,
        refreshRequests: DEFAULT_NOOP,
        locsState: null,
        pendingRecoveryRequests: null,
        recoveryRequestsHistory: null,
        updateSetting: () => Promise.reject(),
        refreshLocs: DEFAULT_NOOP,
        refreshOnchainSettings: DEFAULT_NOOP,
        callRefreshLocs: false,
        callRefreshRequests: false,
        callRefreshSettings: false,
        callRefreshLegalOfficer: false,
        callRefreshVotes: false,
        refreshLegalOfficer: DEFAULT_NOOP,
        reconnected: false,
        votes: null,
        refreshVotes: DEFAULT_NOOP,
        mutateVotes: DEFAULT_NOOP,
        mutateLocsState: DEFAULT_NOOP,
        locs: {
            Identity: Locs.empty("LegalOfficer"),
            Transaction: Locs.empty("LegalOfficer"),
            Collection: Locs.empty("LegalOfficer"),
        }
    };
}

const LegalOfficerContextObject: React.Context<FullLegalOfficerContext> = React.createContext(initialContextValue());

type ActionType =
    'CHANGE_ADDRESS'
    | 'SET_REQUESTS_DATA'
    | 'UPDATE_SETTING'
    | 'SET_LOCS_DATA'
    | 'SET_REFRESH_LOCS'
    | 'SET_ONCHAIN_SETTINGS'
    | 'SET_REFRESH_ONCHAIN_SETTINGS'
    | 'SET_REFRESH_REQUESTS'
    | 'SET_UPDATE_SETTING'
    | 'REFRESH_LOCS_CALLED'
    | 'REFRESH_REQUESTS_CALLED'
    | 'REFRESH_SETTINGS_CALLED'
    | 'SET_LEGAL_OFFICER'
    | 'SET_REFRESH_LEGAL_OFFICER'
    | 'REFRESH_LEGAL_OFFICER_CALLED'
    | 'MUST_RECONNECT'
    | 'SET_REFRESH_VOTES'
    | 'REFRESH_VOTES_CALLED'
    | 'SET_VOTES'
    | 'SET_VOTE'
    | 'SET_MUTATE_LOC_STATE'
    | 'SET_MUTATE_VOTES'
;

interface Action {
    type: ActionType;
    dataAddress?: ValidAccountId;
    locsState?: LocsState;
    pendingRecoveryRequests?: PendingRecoveryRequest[],
    recoveryRequestsHistory?: ReviewedRecoveryRequest[],
    refreshRequests?: (clearBeforeRefresh: boolean) => void;
    clearBeforeRefresh?: boolean;
    axios?: AxiosInstance;
    currentAccount?: string;
    rejectRequest?: ((requestId: string, reason: string) => Promise<void>) | null;
    pendingVaultTransferRequests?: VaultTransferRequest[];
    vaultTransferRequestsHistory?: VaultTransferRequest[];
    settings?: Record<string, string>;
    onchainSettings?: LegalOfficerData;
    missingSettings?: MissingSettings;
    updateSetting?: (id: string, value: string) => Promise<void>;
    id?: string;
    value?: string;
    refreshLocs?: (newLocsState?: LocsState) => Promise<void>;
    refreshAddress?: string;
    refreshOnchainSettings?: () => void;
    refreshLegalOfficer?: () => void;
    legalOfficer?: LegalOfficer;
    votes?: Votes;
    refreshVotes?: () => Promise<void>;
    mutateVotes?: (mutator: (current: Votes) => Promise<Votes>) => Promise<void>;
    mutateLocsState?: (mutator: (current: LocsState) => Promise<LocsState>) => Promise<void>;
    locs?: Record<LocType, Locs>;
}

const reducer: Reducer<FullLegalOfficerContext, Action> = (state: FullLegalOfficerContext, action: Action): FullLegalOfficerContext => {
    switch (action.type) {
        case 'CHANGE_ADDRESS':
            return {
                ...state,
                dataAddress: action.dataAddress!,
                axios: action.axios,
                callRefreshLocs: true,
                callRefreshRequests: true,
                callRefreshSettings: true,
                callRefreshLegalOfficer: true,
                callRefreshVotes: true,
                legalOfficer: undefined,
                reconnected: false,
            }
        case "REFRESH_LOCS_CALLED":
            return {
                ...state,
                callRefreshLocs: false,
            };
        case "SET_LOCS_DATA":
            if (action.dataAddress === state.dataAddress) {
                return {
                    ...state,
                    locsState: action.locsState!,
                    locs: action.locs!,
                }
            } else {
                return state;
            }
        case "REFRESH_REQUESTS_CALLED":
            return {
                ...state,
                callRefreshRequests: false,
            };
        case 'SET_REQUESTS_DATA':
            if(action.dataAddress === state.dataAddress) {
                return {
                    ...state,
                    pendingRecoveryRequests: action.pendingRecoveryRequests!,
                    recoveryRequestsHistory: action.recoveryRequestsHistory!,
                    pendingVaultTransferRequests: action.pendingVaultTransferRequests!,
                    vaultTransferRequestsHistory: action.vaultTransferRequestsHistory!,
                    settings: action.settings!,
                };
            } else {
                return state;
            }
        case "UPDATE_SETTING":
            return {
                ...state,
                settings: {
                    ...state.settings!,
                    [action.id!]: action.value!,
                }
            }
        case 'SET_REFRESH_LOCS':
            return {
                ...state,
                refreshLocs: action.refreshLocs!,
            };
        case "REFRESH_SETTINGS_CALLED":
            return {
                ...state,
                callRefreshSettings: false,
            };
        case 'SET_ONCHAIN_SETTINGS':
            return {
                ...state,
                onchainSettings: action.onchainSettings!,
                legalOfficer: action.legalOfficer!,
                missingSettings: action.missingSettings,
            }
        case 'SET_REFRESH_ONCHAIN_SETTINGS':
            return {
                ...state,
                refreshOnchainSettings: action.refreshOnchainSettings!,
            }
        case 'SET_REFRESH_REQUESTS':
            return {
                ...state,
                refreshRequests: action.refreshRequests!,
            }
        case 'SET_UPDATE_SETTING':
            return {
                ...state,
                updateSetting: action.updateSetting!,
            }
        case "REFRESH_LEGAL_OFFICER_CALLED":
            return {
                ...state,
                callRefreshLegalOfficer: false,
            };
        case "SET_LEGAL_OFFICER":
            if (action.dataAddress === state.dataAddress) {
                return {
                    ...state,
                    legalOfficer: action.legalOfficer!,
                    missingSettings: action.missingSettings,
                }
            } else {
                return state;
            }
        case 'SET_REFRESH_LEGAL_OFFICER':
            return {
                ...state,
                refreshLegalOfficer: action.refreshLegalOfficer!,
            }
        case 'MUST_RECONNECT':
            return {
                ...state,
                reconnected: true,
                dataAddress: null,
            }
        case 'SET_REFRESH_VOTES':
            return {
                ...state,
                refreshVotes: action.refreshVotes!,
            }
        case "REFRESH_VOTES_CALLED":
            return {
                ...state,
                callRefreshVotes: false,
            };
        case "SET_VOTES":
            if (action.dataAddress === state.dataAddress) {
                return {
                    ...state,
                    votes: action.votes!,
                }
            } else {
                return state;
            }
        case 'SET_VOTE':
            return {
                ...state,
                mutateVotes: action.mutateVotes!,
            }
        case 'SET_MUTATE_LOC_STATE':
            return {
                ...state,
                mutateLocsState: action.mutateLocsState!,
            }
        case 'SET_MUTATE_VOTES':
            return {
                ...state,
                mutateVotes: action.mutateVotes!,
            }
        default:
            /* istanbul ignore next */
            throw new Error(`Unknown type: ${action.type}`);
    }
}

export interface Props {
    children: JSX.Element | JSX.Element[] | null
}

export function LegalOfficerContextProvider(props: Props) {
    const { api, accounts, axiosFactory, client, reconnect } = useLogionChain();
    const { colorTheme, setColorTheme, viewer, setViewer } = useCommonContext();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue());

    const isReadyLegalOfficer = useMemo(() => {
        return accounts !== null && accounts !== undefined
            && accounts.current !== null && accounts.current !== undefined
            && client && client.allLegalOfficers.find(legalOfficer => legalOfficer.account.equals(accounts.current?.accountId) && legalOfficer.node) !== undefined
    }, [ accounts, client ]);

    useEffect(() => {
        if(colorTheme !== LIGHT_MODE && setColorTheme !== null) {
            setColorTheme(LIGHT_MODE);
        }
    }, [ colorTheme, setColorTheme ]);

    useEffect(() => {
        if(viewer !== "LegalOfficer" && setViewer) {
            setViewer("LegalOfficer");
        }
    }, [ viewer, setViewer ]);

    useEffect(() => {
        const now = DateTime.now();
        if(accounts !== null && accounts.current !== undefined
            && client !== null && client.isTokenValid(now)
            && axiosFactory
            && !accounts.current.accountId.equals(contextValue.dataAddress)) {

            const dataAddress = accounts.current.accountId;
            let axios: AxiosInstance | undefined;
            if(isReadyLegalOfficer) {
                axios = axiosFactory(dataAddress);
            }
            dispatch({
                type: "CHANGE_ADDRESS",
                dataAddress,
                axios,
            });
        }
    }, [ accounts, client, contextValue.dataAddress, contextValue.axios, axiosFactory, isReadyLegalOfficer, contextValue.legalOfficer ]);

    useEffect(() => {
        if(contextValue.legalOfficer && contextValue.legalOfficer.account.equals(contextValue.dataAddress) && contextValue.legalOfficer?.node
            && !isReadyLegalOfficer
            && !contextValue.reconnected) {

            dispatch({
                type: "MUST_RECONNECT"
            });
            reconnect();
        }
    }, [ contextValue.legalOfficer, client, contextValue.reconnected, contextValue.dataAddress, reconnect, isReadyLegalOfficer ]);

    // ------------------ LOCs -------------------------------

    const refreshLocs = useCallback(async (newLocsState?: LocsState) => {
        if(newLocsState) {
            const locs = getLocsMap(newLocsState, "LegalOfficer");
            dispatch({
                type: "SET_LOCS_DATA",
                dataAddress: contextValue.dataAddress!,
                locsState: newLocsState,
                locs,
            });
        } else {
            const now = DateTime.now();
            if(api
                && accounts && accounts.current
                && client !== null && client.isTokenValid(now)
                && contextValue.legalOfficer
                && axiosFactory
                && isReadyLegalOfficer) {

                dispatch({
                    type: "REFRESH_LOCS_CALLED"
                });

                const legalOfficer = contextValue.legalOfficer;
                const locsState = await client.locsState(fetchAllLocsParams(legalOfficer));
                const locs = getLocsMap(locsState, "LegalOfficer");

                dispatch({
                    type: "SET_LOCS_DATA",
                    dataAddress: accounts.current.accountId,
                    locsState,
                    locs,
                });
            }
        }
    }, [ api, dispatch, accounts, client, axiosFactory, isReadyLegalOfficer, contextValue.legalOfficer, contextValue.dataAddress ]);

    useEffect(() => {
        if(contextValue.refreshLocs !== refreshLocs) {
            dispatch({
                type: 'SET_REFRESH_LOCS',
                refreshLocs: refreshLocs,
            });
        }
    }, [ contextValue.refreshLocs, refreshLocs ]);

    useEffect(() => {
        if(contextValue.callRefreshLocs) {
            refreshLocs();
        }
    }, [ contextValue.callRefreshLocs, refreshLocs ]);

    // ------------------ Settings -------------------------------

    const refreshOnchainSettings = useCallback(async () => {
        if(accounts && accounts.current && api) {
            dispatch({
                type: "REFRESH_SETTINGS_CALLED"
            });
            const currentAddress = accounts.current.accountId;
            const onchainSettings = await api.queries.getLegalOfficerData(currentAddress);
            let legalOfficer: LegalOfficer | undefined = contextValue.legalOfficer;
            if(!legalOfficer) {
                legalOfficer = client?.allLegalOfficers.find(legalOfficer => legalOfficer.account.equals(currentAddress));
            }
            if(legalOfficer) {
                legalOfficer.node = onchainSettings.hostData?.baseUrl || "";
            }
            const missingSettings = getMissingSettings(legalOfficer, onchainSettings);
            dispatch({
                type: "SET_ONCHAIN_SETTINGS",
                dataAddress: currentAddress,
                onchainSettings,
                missingSettings,
                legalOfficer,
            });
        }
    }, [ accounts, api, contextValue.legalOfficer, client?.allLegalOfficers ]);

    useEffect(() => {
        if(contextValue.refreshOnchainSettings !== refreshOnchainSettings) {
            dispatch({
                type: "SET_REFRESH_ONCHAIN_SETTINGS",
                refreshOnchainSettings: refreshOnchainSettings,
            })
        }
    }, [ contextValue.refreshOnchainSettings, refreshOnchainSettings ]);

    useEffect(() => {
        if(contextValue.callRefreshSettings) {
            refreshOnchainSettings();
        }
    }, [ contextValue.callRefreshSettings, refreshOnchainSettings ]);

    const updateSettingCallback = useCallback(async (id: string, value: string): Promise<void> => {
        const axios = axiosFactory!(contextValue.dataAddress!);
        await updateSetting(axios, contextValue.dataAddress!.address, id, value);
        dispatch({
            type: "UPDATE_SETTING",
            id,
            value,
        })
    }, [ contextValue.dataAddress, axiosFactory ]);

    useEffect(() => {
        if(contextValue.updateSetting !== updateSettingCallback) {
            dispatch({
                type: "SET_UPDATE_SETTING",
                updateSetting: updateSettingCallback,
            })
        }
    }, [ contextValue.updateSetting, updateSettingCallback ]);

    // ------------------ Protection, recovery and vault -------------------------------

    const refreshRequests = useCallback(() => {
        if(accounts && accounts.current && axiosFactory && isReadyLegalOfficer && client !== null) {
            dispatch({
                type: "REFRESH_REQUESTS_CALLED"
            });
            const currentAddress = accounts.current.accountId;

            (async function() {
                const axios = axiosFactory(currentAddress);
                const recoveryReview = client.withCurrentAccount(currentAddress).recoveryReview;
                const allAccountRecoveryRequests = await recoveryReview.fetchRecoveryRequests();
                const pendingRecoveryRequests = allAccountRecoveryRequests.pendingRequests
                    .sort((a, b) => a.data.createdOn.localeCompare(b.data.createdOn));
                const recoveryRequestsHistory = allAccountRecoveryRequests.reviewedRequests
                    .sort((a, b) => b.data.createdOn.localeCompare(a.data.createdOn));

                const allVaultTransferRequestsResult = (await new VaultApi(axios, currentAddress).getVaultTransferRequests({
                    legalOfficerAddress: currentAddress.address,
                })).sort((a, b) => b.createdOn.localeCompare(a.createdOn));
                const pendingVaultTransferRequests = allVaultTransferRequestsResult.filter(request => request.status === "PENDING");
                const vaultTransferRequestsHistory = allVaultTransferRequestsResult.filter(request => [ "CANCELLED", "REJECTED_CANCELLED", "REJECTED", "ACCEPTED" ].includes(request.status));

                const settings = await getSettings(axios, currentAddress.address);

                dispatch({
                    type: "SET_REQUESTS_DATA",
                    dataAddress: currentAddress,
                    pendingRecoveryRequests,
                    recoveryRequestsHistory,
                    pendingVaultTransferRequests,
                    vaultTransferRequestsHistory,
                    settings,
                });
            })();
        }
    }, [ accounts, axiosFactory, isReadyLegalOfficer, client ]);

    useEffect(() => {
        if(contextValue.refreshRequests !== refreshRequests) {
            dispatch({
                type: "SET_REFRESH_REQUESTS",
                refreshRequests,
            })
        }
    }, [ contextValue.refreshRequests, refreshRequests ]);

    useEffect(() => {
        if(contextValue.callRefreshRequests) {
            refreshRequests();
        }
    }, [ contextValue.callRefreshRequests, refreshRequests ]);

    // ------------------ Legal Officer -------------------------------

    const refreshLegalOfficer = useCallback(async () => {
        if(accounts && accounts.current && api && client) {
            dispatch({
                type: "REFRESH_LEGAL_OFFICER_CALLED"
            });

            const currentAddress = accounts.current.accountId;

            (async function() {
                const onchainSettings = await api.queries.getLegalOfficerData(currentAddress);
                const legalOfficer = (await client.directoryClient.getLegalOfficers()).find(legalOfficer => legalOfficer.account.equals(currentAddress));
                const missingSettings = getMissingSettings(legalOfficer, onchainSettings);
                dispatch({
                    type: "SET_LEGAL_OFFICER",
                    dataAddress: currentAddress,
                    legalOfficer,
                    missingSettings,
                });
            })();
        }
    }, [ accounts, api, client ]);

    useEffect(() => {
        if(contextValue.refreshLegalOfficer !== refreshLegalOfficer) {
            dispatch({
                type: "SET_REFRESH_LEGAL_OFFICER",
                refreshLegalOfficer: refreshLegalOfficer,
            })
        }
    }, [ contextValue.refreshLegalOfficer, refreshLegalOfficer ]);

    useEffect(() => {
        if(contextValue.callRefreshLegalOfficer) {
            refreshLegalOfficer();
        }
    }, [ contextValue.callRefreshLegalOfficer, refreshLegalOfficer ]);

    // ------------------ Votes -------------------------------

    const refreshVotes = useCallback(async (newVotes?: Votes) => {
        if(newVotes) {
            dispatch({
                type: "SET_VOTES",
                dataAddress: contextValue.dataAddress!,
                votes: newVotes,
            });
        } else {
            const now = DateTime.now();
            if(accounts && accounts.current && client && client.isTokenValid(now)) {
                dispatch({
                    type: "REFRESH_VOTES_CALLED"
                });

                const currentAddress = accounts.current.accountId;
                const votes = await client.voter.getVotes();

                dispatch({
                    type: "SET_VOTES",
                    dataAddress: currentAddress,
                    votes,
                });
            }
        }
    }, [ accounts, client, contextValue.dataAddress ]);

    useEffect(() => {
        if(contextValue.refreshVotes !== refreshVotes) {
            dispatch({
                type: 'SET_REFRESH_VOTES',
                refreshVotes: refreshVotes,
            });
        }
    }, [ contextValue.refreshVotes, refreshVotes ]);

    useEffect(() => {
        if(contextValue.callRefreshVotes) {
            refreshVotes();
        }
    }, [ contextValue.callRefreshVotes, refreshVotes ]);

    const mutateVotesCallback = useCallback(async (mutator: (current: Votes) => Promise<Votes>): Promise<void> => {
        const result = await mutator(contextValue.votes!);
        refreshVotes(result);
    }, [ contextValue.votes, refreshVotes ]);

    useEffect(() => {
        if (contextValue.mutateVotes !== mutateVotesCallback) {
            dispatch({
                type: "SET_MUTATE_VOTES",
                mutateVotes: mutateVotesCallback,
            });
        }
    }, [ mutateVotesCallback, contextValue.mutateVotes ]);

    const mutateLocsStateCallback = useCallback(async (mutator: (current: LocsState) => Promise<LocsState>): Promise<void> => {
        const result = await mutator(contextValue.locsState!);
        refreshLocs(result);
    }, [ contextValue.locsState, refreshLocs ]);

    useEffect(() => {
        if (contextValue.mutateLocsState !== mutateLocsStateCallback) {
            dispatch({
                type: "SET_MUTATE_LOC_STATE",
                mutateLocsState: mutateLocsStateCallback,
            });
        }
    }, [ mutateLocsStateCallback, contextValue.mutateLocsState ]);

    // ------------------ Component -------------------------------

    return (
        <LegalOfficerContextObject.Provider value={contextValue}>
            {props.children}
        </LegalOfficerContextObject.Provider>
    );
}

export function useLegalOfficerContext(): LegalOfficerContext {
    return { ...useContext(LegalOfficerContextObject) };
}

async function getSettings(axios: AxiosInstance, legalOfficer: string): Promise<Record<string, string>> {
    const response = await axios.get(`/api/setting/${ legalOfficer }`);
    return response.data.settings;
}

async function updateSetting(axios: AxiosInstance, legalOfficer: string, id: string, value: string): Promise<void> {
    await axios.put(`/api/setting/${ legalOfficer }/${ id }`, { value });
}

function getMissingSettings(legalOfficer: LegalOfficer | undefined, onchainSettings: LegalOfficerData): MissingSettings | undefined {
    let missingSettings: MissingSettings | undefined;

    if(!onchainSettings.hostData?.baseUrl || !onchainSettings.hostData?.nodeId || !onchainSettings.hostData?.region || legalOfficer === undefined) {
        missingSettings = {
            directory: legalOfficer === undefined,
            baseUrl: onchainSettings.hostData?.baseUrl === undefined,
            nodeId: onchainSettings.hostData?.nodeId === undefined,
            region: onchainSettings.hostData?.region === undefined,
        };
    }

    return missingSettings;
}
