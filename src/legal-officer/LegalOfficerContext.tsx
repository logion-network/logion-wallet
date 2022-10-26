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
} from '@logion/client';
import { ProtectionRequest } from '@logion/client/dist/RecoveryClient';

import { fetchProtectionRequests } from '../common/Model';
import { useCommonContext } from '../common/CommonContext';
import { LIGHT_MODE } from './Types';
import { useLogionChain } from '../logion-chain';
import { VaultApi } from '../vault/VaultApi';
import { LocType, IdentityLocType } from "@logion/node-api/dist/Types";
import { DateTime } from "luxon";
import { getLegalOfficerData, LegalOfficerData } from './LegalOfficerData';
import { fetchAllLocsParams } from 'src/loc/LegalOfficerLocContext';

export const SETTINGS_KEYS = [ 'oath' ];

export type SettingId = typeof SETTINGS_KEYS[number];

export const SETTINGS_DESCRIPTION: Record<SettingId, string> = {
    oath: "Statement of facts: oath text"
};

const DEFAULT_NOOP = () => {};

export interface MissingSettings {
    directory: boolean;
    nodeId: boolean;
    baseUrl: boolean;
}

export interface LegalOfficerContext {
    refreshRequests: ((clearBeforeRefresh: boolean) => void),
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
    rejectedLocRequests: Record<LocType, RejectedRequest[]> | null;
    openedLocRequests: Record<LocType, OpenLoc[]> | null;
    closedLocRequests: Record<LocType, (ClosedLoc | ClosedCollectionLoc)[]> | null;
    openedIdentityLocs: OpenLoc[] | null;
    openedIdentityLocsByType: Record<IdentityLocType, OpenLoc[]> | null;
    closedIdentityLocsByType: Record<IdentityLocType, ClosedLoc[]> | null;
    voidTransactionLocs: Record<LocType, (VoidedLoc | VoidedCollectionLoc)[]> | null;
    voidIdentityLocsByType: Record<IdentityLocType, VoidedLoc[]> | null;
    refreshLocs: (newLocsState?: LocsState) => void;
    refreshOnchainSettings: () => void;
    legalOfficer?: LegalOfficer;
    refreshLegalOfficer: () => void;
    reconnected: boolean;
}

interface FullLegalOfficerContext extends LegalOfficerContext {
    dataAddress: string | null;
    callRefreshLocs: boolean;
    callRefreshRequests: boolean;
    callRefreshSettings: boolean;
    callRefreshLegalOfficer: boolean;
}

function initialContextValue(): FullLegalOfficerContext {
    return {
        dataAddress: null,
        refreshRequests: DEFAULT_NOOP,
        pendingProtectionRequests: null,
        activatedProtectionRequests: null,
        protectionRequestsHistory: null,
        pendingRecoveryRequests: null,
        recoveryRequestsHistory: null,
        updateSetting: () => Promise.reject(),
        pendingLocRequests: null,
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
        refreshLegalOfficer: DEFAULT_NOOP,
        reconnected: false,
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
;

interface Action {
    type: ActionType;
    dataAddress?: string;
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
    rejectedLocRequests?: Record<LocType, RejectedRequest[]> | null;
    openedLocRequests?: Record<LocType, OpenLoc[]> | null;
    closedLocRequests?: Record<LocType, (ClosedLoc | ClosedCollectionLoc)[]> | null;
    openedIdentityLocs?: OpenLoc[] | null;
    openedIdentityLocsByType?: Record<IdentityLocType, OpenLoc[]> | null;
    closedIdentityLocsByType?: Record<IdentityLocType, ClosedLoc[]> | null;
    voidTransactionLocs?: Record<LocType, (VoidedLoc | VoidedCollectionLoc)[]> | null;
    voidIdentityLocsByType?: Record<IdentityLocType, VoidedLoc[]> | null;
    refreshLocs?: (newLocsState?: LocsState) => void;
    refreshAddress?: string;
    refreshOnchainSettings?: () => void;
    refreshLegalOfficer?: () => void;
    legalOfficer?: LegalOfficer;
}

const reducer: Reducer<FullLegalOfficerContext, Action> = (state: FullLegalOfficerContext, action: Action): FullLegalOfficerContext => {
    console.log("ACTION %s", action.type)
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
                    pendingLocRequests: action.pendingLocRequests!,
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
            && client && client.allLegalOfficers.find(legalOfficer => legalOfficer.address === accounts.current?.address && legalOfficer.node) !== undefined
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
            && accounts.current.address !== contextValue.dataAddress) {

            const dataAddress = accounts.current.address;
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

    const refreshLocs = useCallback((newLocsState?: LocsState) => {
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
                const currentAddress = currentAccount.address;
                const legalOfficer = contextValue.legalOfficer;
                (async function () {
                    const locsState = await client.locsState(fetchAllLocsParams(legalOfficer));
                    dispatch({
                        type: "SET_LOCS_DATA",
                        dataAddress: currentAddress,
                        ...mapLocsState(locsState),
                    });
                })();
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
            const currentAddress = accounts.current.address;
            const onchainSettings = await getLegalOfficerData({ api, address: currentAddress });
            const legalOfficer = contextValue.legalOfficer ? {
                ...contextValue.legalOfficer,
                node: onchainSettings.baseUrl || "",
            } : undefined;
            const missingSettings = getMissingSettings(legalOfficer, onchainSettings);
            dispatch({
                type: "SET_ONCHAIN_SETTINGS",
                dataAddress: currentAddress,
                onchainSettings,
                missingSettings,
                legalOfficer,
            });
        }
    }, [ accounts, api, contextValue.legalOfficer ]);

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
        await updateSetting(axios, id, value);
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
            const currentAddress = accounts.current.address;

            (async function() {
                const axios = axiosFactory(currentAddress);
                const pendingProtectionRequests = await fetchProtectionRequests(axios, {
                    statuses: ["PENDING"],
                    kind: 'PROTECTION_ONLY',
                });
                const activatedProtectionRequests = await fetchProtectionRequests(axios, {
                    statuses: ["ACTIVATED"],
                    kind: 'ANY',
                });
                const protectionRequestsHistory = await fetchProtectionRequests(axios, {
                    statuses: ["ACCEPTED", "REJECTED", "ACTIVATED", "CANCELLED", "REJECTED_CANCELLED", "ACCEPTED_CANCELLED"],
                    kind: 'PROTECTION_ONLY',
                });
        
                const pendingRecoveryRequests = await fetchProtectionRequests(axios, {
                    statuses: ["PENDING"],
                    kind: 'RECOVERY',
                });
                const recoveryRequestsHistory = await fetchProtectionRequests(axios, {
                    statuses: ["ACCEPTED", "REJECTED", "ACTIVATED", "CANCELLED", "REJECTED_CANCELLED", "ACCEPTED_CANCELLED"],
                    kind: 'RECOVERY',
                });
        
                const vaultSpecificationFragment = {
                    statuses: []
                }
        
                const vaultTransferRequestsResult = await new VaultApi(axios, currentAddress).getVaultTransferRequests({
                    ...vaultSpecificationFragment,
                    statuses: [ "PENDING" ]
                });
                const pendingVaultTransferRequests = vaultTransferRequestsResult.sort((a, b) => b.createdOn.localeCompare(a.createdOn));
        
                const vaultTransferRequestsHistoryResult = await new VaultApi(axios, currentAddress).getVaultTransferRequests({
                    ...vaultSpecificationFragment,
                    statuses: [ "CANCELLED", "REJECTED_CANCELLED", "REJECTED", "ACCEPTED" ]
                });
                const vaultTransferRequestsHistory = vaultTransferRequestsHistoryResult.sort((a, b) => b.createdOn.localeCompare(a.createdOn));
        
                const settings = await getSettings(axios);

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

            const currentAddress = accounts.current.address;

            (async function() {
                const onchainSettings = await getLegalOfficerData({ api, address: currentAddress });
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

async function getSettings(axios: AxiosInstance): Promise<Record<string, string>> {
    const response = await axios.get('/api/setting');
    return response.data.settings;
}

async function updateSetting(axios: AxiosInstance, id: string, value: string): Promise<void> {
    await axios.put(`/api/setting/${id}`, { value });
}

function getMissingSettings(legalOfficer: LegalOfficer | undefined, onchainSettings: LegalOfficerData): MissingSettings | undefined {
    let missingSettings: MissingSettings | undefined;

    if(!onchainSettings.baseUrl || !onchainSettings.nodeId || legalOfficer === undefined) {
        missingSettings = {
            directory: legalOfficer === undefined,
            baseUrl: onchainSettings.baseUrl === undefined,
            nodeId: onchainSettings.nodeId === undefined,
        };
    }

    return missingSettings;
}

function mapLocsState(locsState: LocsState) {
    const pendingLocRequests: Record<LocType, PendingRequest[]> = locsState.pendingRequests;
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
        pendingLocRequests,
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
