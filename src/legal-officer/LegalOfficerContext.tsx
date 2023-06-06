import React, { useContext, useEffect, useReducer, Reducer, useCallback, useMemo } from 'react';
import { AxiosInstance } from 'axios';
import {
    VaultTransferRequest,
    LegalOfficer,
    PendingRequest,
    RejectedRequest,
    OpenLoc,
    ClosedLoc,
    ClosedCollectionLoc,
    VoidedLoc,
    VoidedCollectionLoc,
    LocsState,
    SignCallback,
} from '@logion/client';
import { ProtectionRequest } from '@logion/client/dist/RecoveryClient.js';

import { fetchProtectionRequests } from '../common/Model';
import { useCommonContext } from '../common/CommonContext';
import { LIGHT_MODE } from './Types';
import { useLogionChain } from '../logion-chain';
import { VaultApi } from '../vault/VaultApi';
import { LocType, IdentityLocType, LegalOfficerData } from "@logion/node-api";
import { DateTime } from "luxon";
import { fetchAllLocsParams } from 'src/loc/LegalOfficerLocContext';
import { getVotes, Vote, VoteResult, vote as clientVote } from './client';
import { AcceptedRequest } from "@logion/client/dist/Loc";

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
    refreshRequests: ((clearBeforeRefresh: boolean) => void),
    locsState: LocsState | null,
    pendingProtectionRequests: ProtectionRequest[] | null,
    activatedProtectionRequests: ProtectionRequest[] | null,
    protectionRequestsHistory: ProtectionRequest[] | null,
    pendingRecoveryRequests: ProtectionRequest[] | null,
    recoveryRequestsHistory: ProtectionRequest[] | null,
    axios?: AxiosInstance;
    pendingVaultTransferRequests?: VaultTransferRequest[];
    vaultTransferRequestsHistory?: VaultTransferRequest[];
    settings?: Record<string, string>;
    onchainSettings?: LegalOfficerData;
    updateSetting: (id: SettingId, value: string) => Promise<void>;
    missingSettings?: MissingSettings;
    pendingLocRequests: Record<LocType, PendingRequest[]> | null;
    acceptedLocRequests: Record<LocType, AcceptedRequest[]> | null;
    rejectedLocRequests: Record<LocType, RejectedRequest[]> | null;
    openedLocRequests: Record<LocType, OpenLoc[]> | null;
    closedLocRequests: Record<LocType, (ClosedLoc | ClosedCollectionLoc)[]> | null;
    openedIdentityLocs: OpenLoc[] | null;
    openedIdentityLocsByType: Record<IdentityLocType, OpenLoc[]> | null;
    closedIdentityLocsByType: Record<IdentityLocType, ClosedLoc[]> | null;
    voidTransactionLocs: Record<LocType, (VoidedLoc | VoidedCollectionLoc)[]> | null;
    voidIdentityLocsByType: Record<IdentityLocType, VoidedLoc[]> | null;
    refreshLocs: (newLocsState?: LocsState) => Promise<void>;
    refreshOnchainSettings: () => void;
    legalOfficer?: LegalOfficer;
    refreshLegalOfficer: () => void;
    reconnected: boolean;
    votes: Vote[];
    refreshVotes: () => Promise<void>;
    vote: (params: { targetVote: Vote, myVote: VoteResult, callback: SignCallback }) => Promise<void>;
}

interface FullLegalOfficerContext extends LegalOfficerContext {
    dataAddress: string | null;
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
        pendingProtectionRequests: null,
        activatedProtectionRequests: null,
        protectionRequestsHistory: null,
        pendingRecoveryRequests: null,
        recoveryRequestsHistory: null,
        updateSetting: () => Promise.reject(),
        pendingLocRequests: null,
        acceptedLocRequests: null,
        rejectedLocRequests: null,
        openedLocRequests: null,
        closedLocRequests: null,
        openedIdentityLocs: null,
        openedIdentityLocsByType: null,
        closedIdentityLocsByType: null,
        voidTransactionLocs: null,
        voidIdentityLocsByType: null,
        refreshLocs: DEFAULT_NOOP,
        refreshOnchainSettings: DEFAULT_NOOP,
        callRefreshLocs: false,
        callRefreshRequests: false,
        callRefreshSettings: false,
        callRefreshLegalOfficer: false,
        callRefreshVotes: false,
        refreshLegalOfficer: DEFAULT_NOOP,
        reconnected: false,
        votes: [],
        refreshVotes: DEFAULT_NOOP,
        vote: DEFAULT_NOOP,
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
;

interface Action {
    type: ActionType;
    dataAddress?: string;
    locsState?: LocsState;
    pendingProtectionRequests?: ProtectionRequest[];
    protectionRequestsHistory?: ProtectionRequest[];
    activatedProtectionRequests?: ProtectionRequest[];
    pendingRecoveryRequests?: ProtectionRequest[],
    recoveryRequestsHistory?: ProtectionRequest[],
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
    pendingLocRequests?: Record<LocType, PendingRequest[]> | null;
    acceptedLocRequests?: Record<LocType, AcceptedRequest[]> | null;
    rejectedLocRequests?: Record<LocType, RejectedRequest[]> | null;
    openedLocRequests?: Record<LocType, OpenLoc[]> | null;
    closedLocRequests?: Record<LocType, (ClosedLoc | ClosedCollectionLoc)[]> | null;
    openedIdentityLocs?: OpenLoc[] | null;
    openedIdentityLocsByType?: Record<IdentityLocType, OpenLoc[]> | null;
    closedIdentityLocsByType?: Record<IdentityLocType, ClosedLoc[]> | null;
    voidTransactionLocs?: Record<LocType, (VoidedLoc | VoidedCollectionLoc)[]> | null;
    voidIdentityLocsByType?: Record<IdentityLocType, VoidedLoc[]> | null;
    refreshLocs?: (newLocsState?: LocsState) => Promise<void>;
    refreshAddress?: string;
    refreshOnchainSettings?: () => void;
    refreshLegalOfficer?: () => void;
    legalOfficer?: LegalOfficer;
    votes?: Vote[];
    refreshVotes?: () => Promise<void>;
    vote?: (params: { targetVote: Vote, myVote: VoteResult, callback: SignCallback }) => Promise<void>;
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
                    pendingLocRequests: action.pendingLocRequests!,
                    acceptedLocRequests: action.acceptedLocRequests!,
                    rejectedLocRequests: action.rejectedLocRequests!,
                    openedLocRequests: action.openedLocRequests!,
                    closedLocRequests: action.closedLocRequests!,
                    openedIdentityLocs: action.openedIdentityLocs!,
                    openedIdentityLocsByType: action.openedIdentityLocsByType!,
                    closedIdentityLocsByType: action.closedIdentityLocsByType!,
                    voidTransactionLocs: action.voidTransactionLocs!,
                    voidIdentityLocsByType: action.voidIdentityLocsByType!,
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
                    pendingProtectionRequests: action.pendingProtectionRequests!,
                    protectionRequestsHistory: action.protectionRequestsHistory!,
                    activatedProtectionRequests: action.activatedProtectionRequests!,
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
                vote: action.vote!,
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
    const { api, accounts, axiosFactory, client, reconnect, signer } = useLogionChain();
    const { colorTheme, setColorTheme, viewer, setViewer } = useCommonContext();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue());

    const isReadyLegalOfficer = useMemo(() => {
        return accounts !== null && accounts !== undefined
            && accounts.current !== null && accounts.current !== undefined
            && client && client.allLegalOfficers.find(legalOfficer => legalOfficer.address === accounts.current?.accountId.address && legalOfficer.node) !== undefined
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
            && accounts.current.accountId.address !== contextValue.dataAddress) {

            const dataAddress = accounts.current.accountId.address;
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
        if(contextValue.legalOfficer && contextValue.legalOfficer.address === contextValue.dataAddress && contextValue.legalOfficer?.node
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
            dispatch({
                type: "SET_LOCS_DATA",
                dataAddress: contextValue.dataAddress!,
                ...mapLocsState(newLocsState),
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

                const currentAccount = accounts.current;
                const currentAddress = currentAccount.accountId.address;
                const legalOfficer = contextValue.legalOfficer;
                const locsState = await client.locsState(fetchAllLocsParams(legalOfficer));

                dispatch({
                    type: "SET_LOCS_DATA",
                    dataAddress: currentAddress,
                    ...mapLocsState(locsState),
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
            const currentAddress = accounts.current.accountId.address;
            const onchainSettings = await api.queries.getLegalOfficerData(currentAddress);
            let legalOfficer: LegalOfficer | undefined = contextValue.legalOfficer;
            if(!legalOfficer) {
                legalOfficer = client?.allLegalOfficers.find(legalOfficer => legalOfficer.address === currentAddress);
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
        await updateSetting(axios, contextValue.dataAddress!, id, value);
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
        if(accounts && accounts.current && axiosFactory && isReadyLegalOfficer) {
            dispatch({
                type: "REFRESH_REQUESTS_CALLED"
            });
            const currentAddress = accounts.current.accountId.address;

            (async function() {
                const axios = axiosFactory(currentAddress);

                const allRequests = await fetchProtectionRequests(axios, {
                    legalOfficerAddress: currentAddress,
                });
                const pendingProtectionRequests = allRequests.filter(request => ["PENDING"].includes(request.status) && !request.isRecovery);
                const activatedProtectionRequests = allRequests.filter(request => ["ACTIVATED"].includes(request.status));
                const pendingRecoveryRequests = allRequests.filter(request => ["PENDING"].includes(request.status) && request.isRecovery);
                const protectionRequestsHistory = allRequests.filter(request =>
                    ["ACCEPTED", "REJECTED", "ACTIVATED", "CANCELLED", "REJECTED_CANCELLED", "ACCEPTED_CANCELLED"].includes(request.status)
                    && !request.isRecovery
                );
                const recoveryRequestsHistory = allRequests.filter(request =>
                    ["ACCEPTED", "REJECTED", "ACTIVATED", "CANCELLED", "REJECTED_CANCELLED", "ACCEPTED_CANCELLED"].includes(request.status)
                    && request.isRecovery
                );

                const allVaultTransferRequestsResult = (await new VaultApi(axios, currentAddress).getVaultTransferRequests({
                    legalOfficerAddress: currentAddress,
                })).sort((a, b) => b.createdOn.localeCompare(a.createdOn));
                const pendingVaultTransferRequests = allVaultTransferRequestsResult.filter(request => request.status === "PENDING");
                const vaultTransferRequestsHistory = allVaultTransferRequestsResult.filter(request => [ "CANCELLED", "REJECTED_CANCELLED", "REJECTED", "ACCEPTED" ].includes(request.status));

                const settings = await getSettings(axios, currentAddress);

                dispatch({
                    type: "SET_REQUESTS_DATA",
                    dataAddress: currentAddress,
                    pendingProtectionRequests,
                    activatedProtectionRequests,
                    protectionRequestsHistory,
                    pendingRecoveryRequests,
                    recoveryRequestsHistory,
                    pendingVaultTransferRequests,
                    vaultTransferRequestsHistory,
                    settings,
                });
            })();
        }
    }, [ accounts, axiosFactory, isReadyLegalOfficer ]);

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

            const currentAddress = accounts.current.accountId.address;

            (async function() {
                const onchainSettings = await api.queries.getLegalOfficerData(currentAddress);
                const legalOfficer = (await client.directoryClient.getLegalOfficers()).find(legalOfficer => legalOfficer.address === currentAddress);
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

    const refreshVotes = useCallback(async () => {
        const now = DateTime.now();
        if(accounts && accounts.current && client && client.isTokenValid(now)) {
            dispatch({
                type: "REFRESH_VOTES_CALLED"
            });

            const currentAddress = accounts.current.accountId.address;
            const votes = await getVotes(client);

            dispatch({
                type: "SET_VOTES",
                dataAddress: currentAddress,
                votes,
            });
        }
    }, [ accounts, client ]);

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

    const voteCallback = useCallback(async (params: {
        targetVote: Vote,
        myVote: VoteResult,
        callback: SignCallback
    }) => {
        const { targetVote, myVote, callback } = params;
        if(client && signer) {
            const newVote = await clientVote({
                vote: targetVote,
                myVote,
                client,
                signer,
                callback,
            });
            const newVotes = contextValue.votes.map(vote => vote.voteId === targetVote.voteId ? newVote : vote);
            dispatch({
                type: "SET_VOTES",
                dataAddress: client.currentAddress?.address,
                votes: newVotes,
            });
        }
    }, [ client, signer, contextValue.votes ]);

    useEffect(() => {
        if(contextValue.vote !== voteCallback) {
            dispatch({
                type: 'SET_VOTE',
                vote: voteCallback,
            });
        }
    }, [ contextValue.vote, voteCallback ]);

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

function mapLocsState(locsState: LocsState) {
    const pendingLocRequests: Record<LocType, PendingRequest[]> = locsState.pendingRequests;
    const acceptedLocRequests: Record<LocType, AcceptedRequest[]> = locsState.acceptedRequests;
    const rejectedLocRequests: Record<LocType, RejectedRequest[]> = locsState.rejectedRequests;
    const openedLocRequests: Record<LocType, OpenLoc[]> = locsState.openLocs;
    const closedLocRequests: Record<LocType, (ClosedLoc | ClosedCollectionLoc)[]> = locsState.closedLocs;
    const voidTransactionLocs: Record<LocType, (VoidedLoc | VoidedCollectionLoc)[]> = locsState.voidedLocs;

    // Identity
    const openedIdentityLocs = locsState.openLocs["Identity"];

    const openedIdentityLocsByType: Record<IdentityLocType, OpenLoc[]> = {
        'Polkadot': locsState.openLocs["Identity"].filter(loc => loc.data().requesterAddress !== undefined),
        'Logion': locsState.openLocs["Identity"].filter(loc => loc.data().requesterAddress === undefined),
    };
    const closedIdentityLocsByType: Record<IdentityLocType, ClosedLoc[]> = {
        'Polkadot': locsState.closedLocs["Identity"].filter(loc => loc.data().requesterAddress !== undefined).map(loc => loc as ClosedLoc),
        'Logion': locsState.closedLocs["Identity"].filter(loc => loc.data().requesterAddress === undefined).map(loc => loc as ClosedLoc),
    }
    const voidIdentityLocsByType: Record<IdentityLocType, VoidedLoc[]> = {
        'Polkadot': locsState.voidedLocs["Identity"].filter(loc => loc.data().requesterAddress !== undefined).map(loc => loc as VoidedLoc),
        'Logion': locsState.voidedLocs["Identity"].filter(loc => loc.data().requesterAddress === undefined).map(loc => loc as VoidedLoc),
    }

    return {
        locsState,
        pendingLocRequests,
        acceptedLocRequests,
        openedLocRequests,
        closedLocRequests,
        rejectedLocRequests,
        openedIdentityLocs,
        openedIdentityLocsByType,
        closedIdentityLocsByType,
        voidTransactionLocs,
        voidIdentityLocsByType,
    };
}
