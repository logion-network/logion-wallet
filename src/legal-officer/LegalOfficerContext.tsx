import React, { useContext, useEffect, useReducer, Reducer, useCallback } from 'react';
import { AxiosInstance } from 'axios';
import { VaultTransferRequest, LocRequest } from '@logion/client';
import { ProtectionRequest } from '@logion/client/dist/RecoveryClient';
import { LogionNodeApi } from "@logion/node-api";

import { fetchProtectionRequests, FetchLocRequestSpecification, fetchLocRequests, } from '../common/Model';
import { useCommonContext } from '../common/CommonContext';
import { LIGHT_MODE } from './Types';
import { AxiosFactory } from '../common/api';
import { useLogionChain } from '../logion-chain';
import { VaultApi } from '../vault/VaultApi';
import { LocType, IdentityLocType, LegalOfficerCase } from "@logion/node-api/dist/Types";
import { DateTime } from "luxon";
import { UUID, toDecimalString } from "@logion/node-api/dist/UUID";
import { getLegalOfficerCasesMap } from "@logion/node-api/dist/LogionLoc";
import { getLegalOfficerData, LegalOfficerData } from './LegalOfficerData';

export const SETTINGS_KEYS = [ 'oath' ];

export type SettingId = typeof SETTINGS_KEYS[number];

export const SETTINGS_DESCRIPTION: Record<SettingId, string> = {
    oath: "Statement of facts: oath text"
};

const DEFAULT_NOOP = () => {};

export interface RequestAndLoc {
    request: LocRequest;
    loc?: LegalOfficerCase;
}

export interface MissingSettings {
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
    pendingLocRequests: Record<LocType, LocRequest[]> | null;
    rejectedLocRequests: Record<LocType, LocRequest[]> | null;
    openedLocRequests: Record<LocType, RequestAndLoc[]> | null;
    closedLocRequests: Record<LocType, RequestAndLoc[]> | null;
    openedIdentityLocs: RequestAndLoc[] | null;
    openedIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null;
    closedIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null;
    voidTransactionLocs: Record<LocType, RequestAndLoc[]> | null;
    voidIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> | null;
    refreshLocs: () => void;
}

interface FullLegalOfficerContext extends LegalOfficerContext {
    dataAddress: string | null;
    fetchForAddress: string | null;
    locsDataAddress: string | null;
    fetchLocsForAddress: string | null;
    refreshAddress?: string;
}

function initialContextValue(): FullLegalOfficerContext {
    return {
        dataAddress: null,
        fetchForAddress: null,
        locsDataAddress: null,
        fetchLocsForAddress: null,
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
    };
}

const LegalOfficerContextObject: React.Context<FullLegalOfficerContext> = React.createContext(initialContextValue());

type ActionType = 'FETCH_IN_PROGRESS'
    | 'SET_DATA'
    | 'SET_CURRENT_USER'
    | 'UPDATE_SETTING'
    | 'FETCH_LOCS_IN_PROGRESS'
    | 'SET_LOCS_DATA'
    | 'SET_REFRESH'
    | 'SET_MISSING_SETTINGS'
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
    pendingLocRequests?: Record<LocType, LocRequest[]>;
    rejectedLocRequests?: Record<LocType, LocRequest[]>;
    openedLocRequests?: Record<LocType, RequestAndLoc[]>;
    closedLocRequests?: Record<LocType, RequestAndLoc[]>;
    openedIdentityLocs?: RequestAndLoc[];
    openedIdentityLocsByType?: Record<IdentityLocType, RequestAndLoc[]>;
    closedIdentityLocsByType?: Record<IdentityLocType, RequestAndLoc[]>;
    voidTransactionLocs?: Record<LocType, RequestAndLoc[]>;
    voidIdentityLocsByType?: Record<IdentityLocType, RequestAndLoc[]>;
    refreshLocs?: (() => void);
    refreshAddress?: string;
}

const reducer: Reducer<FullLegalOfficerContext, Action> = (state: FullLegalOfficerContext, action: Action): FullLegalOfficerContext => {
    console.log("ACTION %s", action.type)
    switch (action.type) {
        case 'FETCH_LOCS_IN_PROGRESS':
            if (action.clearBeforeRefresh!) {
                return {
                    ...state,
                    fetchLocsForAddress: action.dataAddress!,
                    pendingLocRequests: null,
                    rejectedLocRequests: null,
                    openedLocRequests: null,
                    closedLocRequests: null,
                    openedIdentityLocs: null,
                    openedIdentityLocsByType: null,
                    closedIdentityLocsByType: null,
                    voidTransactionLocs: null,
                    voidIdentityLocsByType: null,
                }
            } else {
                return {
                    ...state,
                    fetchLocsForAddress: action.dataAddress!,
                };
            }
        case 'FETCH_IN_PROGRESS':
            if(action.clearBeforeRefresh!) {
                return {
                    ...state,
                    fetchForAddress: action.dataAddress!,
                    pendingProtectionRequests: null,
                    protectionRequestsHistory: null,
                };
            } else {
                return {
                    ...state,
                    fetchForAddress: action.dataAddress!,
                };
            }
        case "SET_LOCS_DATA":
            if (action.dataAddress === state.fetchLocsForAddress) {
                return {
                    ...state,
                    fetchLocsForAddress: null,
                    locsDataAddress: action.dataAddress!,
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
        case 'SET_DATA':
            if(action.dataAddress === state.fetchForAddress) {
                return {
                    ...state,
                    fetchForAddress: null,
                    dataAddress: action.dataAddress!,
                    pendingProtectionRequests: action.pendingProtectionRequests!,
                    protectionRequestsHistory: action.protectionRequestsHistory!,
                    activatedProtectionRequests: action.activatedProtectionRequests!,
                    pendingRecoveryRequests: action.pendingRecoveryRequests!,
                    recoveryRequestsHistory: action.recoveryRequestsHistory!,
                    pendingVaultTransferRequests: action.pendingVaultTransferRequests!,
                    vaultTransferRequestsHistory: action.vaultTransferRequestsHistory!,
                    settings: action.settings!,
                    onchainSettings: action.onchainSettings,
                    missingSettings: action.missingSettings,
                };
            } else {
                return state;
            }
        case "SET_CURRENT_USER": {
            return {
                ...state,
                refreshRequests: action.refreshRequests!,
                axios: action.axios!,
                updateSetting: action.updateSetting!,
            };
        }
        case "UPDATE_SETTING":
            return {
                ...state,
                settings: {
                    ...state.settings!,
                    [action.id!]: action.value!,
                }
            }
        case 'SET_REFRESH':
            return {
                ...state,
                refreshLocs: action.refreshLocs!,
                refreshAddress: action.refreshAddress!,
            };
        case 'SET_MISSING_SETTINGS':
            return {
                ...state,
                onchainSettings: action.onchainSettings!,
                missingSettings: action.missingSettings,
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
    const { api, accounts, axiosFactory, isCurrentAuthenticated, client, getOfficer } = useLogionChain();
    const { colorTheme, setColorTheme } = useCommonContext();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue());

    useEffect(() => {
        if(colorTheme !== LIGHT_MODE && setColorTheme !== null) {
            setColorTheme(LIGHT_MODE);
        }
    }, [ colorTheme, setColorTheme ]);

    const refreshLocs = useCallback(() => {
        const now = DateTime.now();
        if(api !== null
            && accounts !== null
            && accounts.current !== undefined
            && client !== null
            && client.isTokenValid(now)
            && axiosFactory !== undefined) {

            const currentAccount = accounts.current;
            const currentAddress = currentAccount.address;
            dispatch({
                type: "FETCH_LOCS_IN_PROGRESS",
                dataAddress: currentAddress,
            });

            (async function () {

                const fetch = async (specification: Partial<FetchLocRequestSpecification>) => {

                    const specificationFragment: FetchLocRequestSpecification = {
                        ownerAddress: currentAddress,
                        statuses: [],
                        locTypes: []
                    }
                    return await fetchLocRequests(axiosFactory(currentAccount.address), {
                        ...specificationFragment,
                        ...specification
                    });
                }

                interface RequestsByType {
                    pending: LocRequest[],
                    rejected: LocRequest[],
                    opened: LocRequest[],
                    closed: LocRequest[],
                    locIds: UUID[]
                }

                async function fetchRequests(locType: LocType): Promise<RequestsByType> {
                    const pending = await fetch({
                        statuses: [ "REQUESTED" ],
                        locTypes: [ locType ]
                    })
                    const opened = await fetch({
                        statuses: [ "OPEN" ],
                        locTypes: [ locType ]
                    })
                    const closed = await fetch({
                        statuses: [ "CLOSED" ],
                        locTypes: [ locType ]
                    })
                    const rejected = await fetch({
                        statuses: [ "REJECTED" ],
                        locTypes: [ locType ]
                    })

                    let locIds = opened.map(loc => new UUID(loc.id))
                    locIds = locIds.concat(closed.map(loc => new UUID(loc.id)));

                    return { pending, rejected, opened, closed, locIds }
                }

                const openedIdentityLocsOnly = await fetch({
                    statuses: [ "OPEN" ],
                    locTypes: [ 'Identity' ]
                })
                const openedIdentityLocsOnlyPolkadot = await fetch({
                    statuses: [ "OPEN" ],
                    locTypes: [ 'Identity' ],
                    identityLocType: 'Polkadot'
                })
                const closedIdentityLocsOnlyPolkadot = await fetch({
                    statuses: [ "CLOSED" ],
                    locTypes: [ 'Identity' ],
                    identityLocType: 'Polkadot'
                })
                const openedIdentityLocsOnlyLogion = await fetch({
                    statuses: [ "OPEN" ],
                    locTypes: [ 'Identity' ],
                    identityLocType: 'Logion'
                })
                const closedIdentityLocsOnlyLogion = await fetch({
                    statuses: [ "CLOSED" ],
                    locTypes: [ 'Identity' ],
                    identityLocType: 'Logion'
                })

                const transactionLocs = await fetchRequests('Transaction');
                const collectionLocs = await fetchRequests('Collection');
                const identityLocs = await fetchRequests('Identity');

                let locIds = transactionLocs.locIds
                    .concat(collectionLocs.locIds)
                    .concat(openedIdentityLocsOnly.map(loc => new UUID(loc.id)))
                    .concat(closedIdentityLocsOnlyPolkadot.map(loc => new UUID(loc.id)))
                    .concat(closedIdentityLocsOnlyLogion.map(loc => new UUID(loc.id)));
                const locs = await getLegalOfficerCasesMap({
                    api: api!,
                    locIds
                });

                const pendingLocRequests: Record<LocType, LocRequest[]> = {
                    'Transaction': transactionLocs.pending,
                    'Collection': collectionLocs.pending,
                    'Identity': identityLocs.pending,
                }
                const rejectedLocRequests: Record<LocType, LocRequest[]> = {
                    'Transaction': transactionLocs.rejected,
                    'Collection': collectionLocs.rejected,
                    'Identity': identityLocs.rejected,
                }
                const openedLocRequests: Record<LocType, RequestAndLoc[]> = {
                    'Transaction': notVoidRequestsAndLocs(transactionLocs.opened, locs),
                    'Collection': notVoidRequestsAndLocs(collectionLocs.opened, locs),
                    'Identity': notVoidRequestsAndLocs(identityLocs.opened, locs),
                }
                const closedLocRequests: Record<LocType, RequestAndLoc[]> = {
                    'Transaction': notVoidRequestsAndLocs(transactionLocs.closed, locs),
                    'Collection': notVoidRequestsAndLocs(collectionLocs.closed, locs),
                    'Identity': notVoidRequestsAndLocs(identityLocs.closed, locs),
                }
                const voidTransactionLocs: Record<LocType, RequestAndLoc[]> = {
                    'Transaction': voidRequestsAndLocs(transactionLocs.opened, locs)
                        .concat(voidRequestsAndLocs(transactionLocs.closed, locs)),
                    'Collection': voidRequestsAndLocs(collectionLocs.opened, locs)
                        .concat(voidRequestsAndLocs(collectionLocs.closed, locs)),
                    'Identity': voidRequestsAndLocs(identityLocs.opened, locs)
                        .concat(voidRequestsAndLocs(identityLocs.closed, locs)),
                }

                // Identity
                const openedIdentityLocs = notVoidRequestsAndLocs(openedIdentityLocsOnly, locs);

                const openedIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> = {
                    'Polkadot': notVoidRequestsAndLocs(openedIdentityLocsOnlyPolkadot, locs),
                    'Logion': notVoidRequestsAndLocs(openedIdentityLocsOnlyLogion, locs)
                };
                const closedIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> = {
                    'Polkadot': notVoidRequestsAndLocs(closedIdentityLocsOnlyPolkadot, locs),
                    'Logion': notVoidRequestsAndLocs(closedIdentityLocsOnlyLogion, locs)
                }
                const voidIdentityLocsByType: Record<IdentityLocType, RequestAndLoc[]> = {
                    'Polkadot': voidRequestsAndLocs(openedIdentityLocsOnlyPolkadot, locs)
                        .concat(voidRequestsAndLocs(closedIdentityLocsOnlyPolkadot, locs)),
                    'Logion': voidRequestsAndLocs(openedIdentityLocsOnlyLogion, locs)
                        .concat(voidRequestsAndLocs(closedIdentityLocsOnlyLogion, locs))
                }

                dispatch({
                    type: "SET_LOCS_DATA",
                    dataAddress: currentAddress,
                    pendingLocRequests,
                    openedLocRequests,
                    closedLocRequests,
                    rejectedLocRequests,
                    openedIdentityLocs,
                    openedIdentityLocsByType,
                    closedIdentityLocsByType,
                    voidTransactionLocs,
                    voidIdentityLocsByType,
                });
            })();
        }
    }, [ api, dispatch, accounts, client, axiosFactory ]);

    function voidRequestsAndLocs(requests: LocRequest[], locs: Record<string, LegalOfficerCase>): RequestAndLoc[] {
        return requests
            .map(request => ({request, loc: locs[toDecimalString(request.id)]}))
            .filter(requestAndLoc => requestAndLoc.loc !== undefined && requestAndLoc.loc.voidInfo !== undefined);
    }

    function notVoidRequestsAndLocs(requests: LocRequest[], locs: Record<string, LegalOfficerCase>): RequestAndLoc[] {
        return requests
            .map(request => ({request, loc: locs[toDecimalString(request.id)]}))
            .filter(requestAndLoc => requestAndLoc.loc !== undefined && requestAndLoc.loc.voidInfo === undefined);
    }

    useEffect(() => {
        if(api !== null
            && client !== null
            && client.isTokenValid(DateTime.now())
            && accounts !== null
            && accounts.current !== undefined
            && contextValue.locsDataAddress !== accounts.current.address
            && contextValue.fetchLocsForAddress !== accounts.current.address) {
            refreshLocs();
        }
    }, [ api, contextValue, refreshLocs, accounts, client ]);

    useEffect(() => {
        if(accounts !== null
            && accounts.current !== undefined
            && contextValue.refreshAddress !== accounts.current.address
            && client !== null) {
            dispatch({
                type: 'SET_REFRESH',
                refreshLocs: refreshLocs,
                refreshAddress: accounts.current.address,
            });
        }
    }, [ contextValue, refreshLocs, dispatch, accounts, client ]);


    useEffect(() => {
        if(accounts !== null
                && getOfficer !== undefined
                && api
                && axiosFactory !== undefined
                && accounts.current !== undefined
                && contextValue.dataAddress !== accounts.current.address
                && contextValue.fetchForAddress !== accounts.current.address
                && isCurrentAuthenticated()
                && !contextValue.missingSettings) {
            const currentAccount = accounts!.current!.address;
            const currentLegalOfficer = getOfficer(currentAccount);
            if(currentLegalOfficer?.node) {
                const refreshRequests = (clear: boolean) => refreshRequestsFunction(clear, currentAccount, dispatch, axiosFactory, api);
                const axios = axiosFactory(currentAccount);
                const updateSettingCallback = async (id: string, value: string) => {
                    await updateSetting(axios, id, value);
                    dispatch({
                        type: "UPDATE_SETTING",
                        id,
                        value,
                    })
                };
                dispatch({
                    type: 'SET_CURRENT_USER',
                    axios,
                    currentAccount,
                    refreshRequests,
                    updateSetting: updateSettingCallback,
                });
                refreshRequests(true);
            } else {
                (async function() {
                    const { missingSettings, onchainSettings } = await getOnchainSettings(api, currentAccount);
                    dispatch({
                        type: "SET_MISSING_SETTINGS",
                        onchainSettings,
                        missingSettings,
                    });
                })();
            }
        }
    }, [ contextValue, axiosFactory, accounts, isCurrentAuthenticated, api, getOfficer ]);

    return (
        <LegalOfficerContextObject.Provider value={contextValue}>
            {props.children}
        </LegalOfficerContextObject.Provider>
    );
}

export function useLegalOfficerContext(): LegalOfficerContext {
    return { ...useContext(LegalOfficerContextObject) };
}

function refreshRequestsFunction(clearBeforeRefresh: boolean, currentAddress: string, dispatch: React.Dispatch<Action>, axiosFactory: AxiosFactory, api: LogionNodeApi) {
    dispatch({
        type: "FETCH_IN_PROGRESS",
        dataAddress: currentAddress,
        clearBeforeRefresh,
    });

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
        const { missingSettings, onchainSettings } = await getOnchainSettings(api, currentAddress);

        dispatch({
            type: "SET_DATA",
            pendingProtectionRequests,
            activatedProtectionRequests,
            protectionRequestsHistory,
            dataAddress: currentAddress,
            pendingRecoveryRequests,
            recoveryRequestsHistory,
            pendingVaultTransferRequests,
            vaultTransferRequestsHistory,
            settings,
            onchainSettings,
            missingSettings,
        });
    })();
}

async function getSettings(axios: AxiosInstance): Promise<Record<string, string>> {
    const response = await axios.get('/api/setting');
    return response.data.settings;
}

async function updateSetting(axios: AxiosInstance, id: string, value: string): Promise<void> {
    await axios.put(`/api/setting/${id}`, { value });
}

async function getOnchainSettings(api: LogionNodeApi, currentAddress: string): Promise<{
    onchainSettings: LegalOfficerData,
    missingSettings: MissingSettings | undefined,
}> {
    let missingSettings: MissingSettings | undefined;
    let onchainSettings = await getLegalOfficerData({ api, address: currentAddress });

    if(onchainSettings && (!onchainSettings.baseUrl || !onchainSettings.nodeId)) {
        missingSettings = {
            baseUrl: onchainSettings.baseUrl === undefined,
            nodeId: onchainSettings.nodeId === undefined,
        };
    }

    return {
        onchainSettings,
        missingSettings,
    }
}
