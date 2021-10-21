import React, { useContext, useEffect, useCallback, useReducer, Reducer } from "react";
import { Option } from '@polkadot/types';

import { useLogionChain } from '../logion-chain';
import { RecoveryConfig, getRecoveryConfig, getProxy } from '../logion-chain/Recovery';
import { Children } from '../common/types/Helpers';
import { AxiosFactory, fetchFromAvailableNodes } from '../common/api';

import { LegalOfficerDecision, ProtectionRequest } from "../common/types/ModelTypes";
import { fetchProtectionRequests } from "../common/Model";
import {
    CreateProtectionRequest,
    createProtectionRequest as modelCreateProtectionRequest,
} from "./trust-protection/Model";
import { useCommonContext } from '../common/CommonContext';
import { DARK_MODE } from './Types';

export interface UserContext {
    dataAddress: string | null,
    fetchForAddress: string | null,
    refreshRequests: ((clearBeforeRefresh: boolean) => void) | null,
    createProtectionRequest: ((request: CreateProtectionRequest) => Promise<void>) | null,
    pendingProtectionRequests: ProtectionRequest[] | null,
    acceptedProtectionRequests: ProtectionRequest[] | null,
    rejectedProtectionRequests: ProtectionRequest[] | null,
    recoveryConfig: Option<RecoveryConfig> | null,
    recoveredAddress?: string | null,
}

interface FullUserContext extends UserContext {
    currentAxiosFactory?: AxiosFactory;
}

function initialContextValue(): FullUserContext {
    return {
        dataAddress: null,
        fetchForAddress: null,
        refreshRequests: null,
        createProtectionRequest: null,
        pendingProtectionRequests: null,
        acceptedProtectionRequests: null,
        rejectedProtectionRequests: null,
        recoveryConfig: null,
    }
}

const UserContextObject: React.Context<FullUserContext> = React.createContext(initialContextValue());

type ActionType = 'FETCH_IN_PROGRESS'
    | 'SET_DATA'
    | 'SET_REFRESH_REQUESTS_FUNCTION'
    | 'SET_CREATE_PROTECTION_REQUEST_FUNCTION'
    | 'SET_CURRENT_AXIOS'
;

interface Action {
    type: ActionType,
    dataAddress?: string,
    pendingProtectionRequests?: ProtectionRequest[],
    acceptedProtectionRequests?: ProtectionRequest[],
    rejectedProtectionRequests?: ProtectionRequest[],
    recoveryConfig?: Option<RecoveryConfig>,
    refreshRequests?: (clearBeforeRefresh: boolean) => void,
    createProtectionRequest?: (request: CreateProtectionRequest) => Promise<void>,
    clearBeforeRefresh?: boolean,
    recoveredAddress?: string | null,
    axiosFactory?: AxiosFactory,
}

const reducer: Reducer<FullUserContext, Action> = (state: FullUserContext, action: Action): FullUserContext => {
    switch (action.type) {
        case 'FETCH_IN_PROGRESS':
            console.log("fetch in progress for " + action.dataAddress!);
            if(action.clearBeforeRefresh!) {
                return {
                    ...state,
                    fetchForAddress: action.dataAddress!,
                    pendingProtectionRequests: null,
                    acceptedProtectionRequests: null,
                    rejectedProtectionRequests: null,
                    recoveryConfig: null,
                    recoveredAddress: null,
                };
            } else {
                return {
                    ...state,
                    fetchForAddress: action.dataAddress!,
                };
            }
        case 'SET_DATA':
            if(action.dataAddress === state.fetchForAddress) {
                console.log("setting data for " + state.fetchForAddress);
                return {
                    ...state,
                    fetchForAddress: null,
                    dataAddress: action.dataAddress!,
                    pendingProtectionRequests: action.pendingProtectionRequests!,
                    acceptedProtectionRequests: action.acceptedProtectionRequests!,
                    rejectedProtectionRequests: action.rejectedProtectionRequests!,
                    recoveryConfig: action.recoveryConfig!,
                    recoveredAddress: action.recoveredAddress!,
                };
            } else {
                console.log(`Skipping data because ${action.dataAddress} <> ${state.fetchForAddress}`);
                return state;
            }
        case "SET_REFRESH_REQUESTS_FUNCTION":
            return {
                ...state,
                refreshRequests: action.refreshRequests!,
            };
        case "SET_CREATE_PROTECTION_REQUEST_FUNCTION":
            return {
                ...state,
                createProtectionRequest: action.createProtectionRequest!,
            };
        case "SET_CURRENT_AXIOS":
            return {
                ...state,
                currentAxiosFactory: action.axiosFactory!,
            };
        default:
            /* istanbul ignore next */
            throw new Error(`Unknown type: ${action.type}`);
    }
}

export interface Props {
    children: Children
}

export function UserContextProvider(props: Props) {
    const { accounts, colorTheme, setColorTheme, axiosFactory } = useCommonContext();
    const { api, apiState } = useLogionChain();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue());

    useEffect(() => {
        if(colorTheme !== DARK_MODE && setColorTheme !== null) {
            setColorTheme(DARK_MODE);
        }
    }, [ colorTheme, setColorTheme ]);

    const refreshRequests = useCallback((clearBeforeRefresh: boolean) => {
        if(api !== null) {
            const currentAddress = accounts!.current!.address;
            dispatch({
                type: "FETCH_IN_PROGRESS",
                dataAddress: currentAddress,
                clearBeforeRefresh
            });

            (async function () {
                const allPendingProtectionRequests = await fetchFromAvailableNodes(axiosFactory!, axios => fetchProtectionRequests(axios, {
                    requesterAddress: currentAddress,
                    decisionStatuses: [ "PENDING" ],
                    kind: "ANY",
                }));
                const allAcceptedProtectionRequests = await fetchFromAvailableNodes(axiosFactory!, axios => fetchProtectionRequests(axios, {
                    requesterAddress: currentAddress,
                    decisionStatuses: [ "ACCEPTED" ],
                    kind: "ANY",
                }));
                const allRejectedProtectionRequests = await fetchFromAvailableNodes(axiosFactory!, axios => fetchProtectionRequests(axios, {
                    requesterAddress: currentAddress,
                    decisionStatuses: [ "REJECTED" ],
                    kind: "ANY",
                }));

                const pendingProtectionRequests = mergePending(allPendingProtectionRequests, allAcceptedProtectionRequests, allRejectedProtectionRequests);
                const acceptedProtectionRequests = mergeAccepted(allAcceptedProtectionRequests);
                const rejectedProtectionRequests = mergeRejected(allPendingProtectionRequests, allRejectedProtectionRequests);

                const recoveryConfig = await getRecoveryConfig({
                    api: api!,
                    accountId: currentAddress
                });

                let recoveredAddress: string | null = null;
                if(acceptedProtectionRequests.length === 1
                    && acceptedProtectionRequests[0].isRecovery
                    && acceptedProtectionRequests[0].status === "ACTIVATED") {
                    const proxy = await getProxy({
                        api: api!,
                        currentAddress
                    });
                    if(proxy.isSome) {
                        recoveredAddress = proxy.unwrap().toString();
                    }
                }

                dispatch({
                    type: "SET_DATA",
                    dataAddress: currentAddress,
                    pendingProtectionRequests,
                    acceptedProtectionRequests,
                    rejectedProtectionRequests,
                    recoveryConfig,
                    recoveredAddress,
                });
            })();
        }
    }, [ axiosFactory, api, dispatch, accounts ]);

    useEffect(() => {
        if(apiState === "READY"
                && axiosFactory !== undefined
                && accounts !== null
                && accounts.current !== undefined
                && contextValue.dataAddress !== accounts.current.address
                && contextValue.fetchForAddress !== accounts.current.address) {
            refreshRequests(true);
        }
    }, [ apiState, axiosFactory, contextValue, accounts, refreshRequests, dispatch ]);

    useEffect(() => {
        if(contextValue.refreshRequests !== refreshRequests && apiState === "READY") {
            dispatch({
                type: "SET_REFRESH_REQUESTS_FUNCTION",
                refreshRequests,
            });
        }
    }, [ apiState, refreshRequests, contextValue, dispatch ]);

    useEffect(() => {
        if (axiosFactory !== undefined
                && apiState === "READY"
                && (contextValue.createProtectionRequest === null || axiosFactory !== contextValue.currentAxiosFactory)) {
            const createProtectionRequest = async (request: CreateProtectionRequest): Promise<void> => {
                const promises = request.legalOfficerAddresses.map(address => modelCreateProtectionRequest(axiosFactory(address)!, request));
                await Promise.all(promises);
            }
            dispatch({
                type: "SET_CREATE_PROTECTION_REQUEST_FUNCTION",
                createProtectionRequest,
            });
        }
    }, [ axiosFactory, apiState, contextValue, refreshRequests, dispatch ]);

    useEffect(() => {
        if(axiosFactory !== undefined
                && contextValue.currentAxiosFactory !== axiosFactory) {
            dispatch({
                type: "SET_CURRENT_AXIOS",
                axiosFactory,
            });
        }
    }, [ axiosFactory, contextValue, dispatch ]);

    return (
        <UserContextObject.Provider value={contextValue}>
            {props.children}
        </UserContextObject.Provider>
    );
}

export function useUserContext(): UserContext {
    return useContext(UserContextObject);
}

function mergePending(pendingProtectionRequests: ProtectionRequest[], acceptedProtectionRequests: ProtectionRequest[], rejectedProtectionRequests: ProtectionRequest[]): ProtectionRequest[] {
    if(pendingProtectionRequests.length + acceptedProtectionRequests.length < 2
        || pendingProtectionRequests.length === 0
        || rejectedProtectionRequests.length > 0) {
        return [];
    }

    const referenceRequest = pendingProtectionRequests[0];
    const mergedRequest: ProtectionRequest = {
        ...referenceRequest,
        decisions: [ cloneWithRequestId(referenceRequest.decisions[0], referenceRequest.id) ]
    };
    if(pendingProtectionRequests.length > 1) {
        mergeOtherRequest(mergedRequest, pendingProtectionRequests[1]);
    } else if(acceptedProtectionRequests.length > 0) {
        mergeOtherRequest(mergedRequest, acceptedProtectionRequests[0]);
    }
    return [ mergedRequest ];
}

function cloneWithRequestId(decision: LegalOfficerDecision, requestId: string): LegalOfficerDecision {
    return {
        ...decision,
        requestId,
    };
}

function mergeOtherRequest(mergedRequest: ProtectionRequest, otherRequest: ProtectionRequest) {
    mergedRequest.decisions.push(cloneWithRequestId(otherRequest.decisions[0], otherRequest.id));
}

function mergeAccepted(acceptedProtectionRequests: ProtectionRequest[]): ProtectionRequest[] {
    if(acceptedProtectionRequests.length < 2) {
        return [];
    }
    const referenceRequest = acceptedProtectionRequests[0];
    const mergedRequest: ProtectionRequest = {
        ...referenceRequest,
        decisions: [ cloneWithRequestId(referenceRequest.decisions[0], referenceRequest.id) ]
    };
    mergeOtherRequest(mergedRequest, acceptedProtectionRequests[1]);
    return [ mergedRequest ];
}

function mergeRejected(pendingProtectionRequests: ProtectionRequest[], rejectedProtectionRequests: ProtectionRequest[]) {
    if(rejectedProtectionRequests.length === 0) {
        return [];
    }
    const referenceRequest = rejectedProtectionRequests[0];
    const mergedRequest: ProtectionRequest = {
        ...referenceRequest,
        decisions: [ cloneWithRequestId(referenceRequest.decisions[0], referenceRequest.id) ]
    };
    if(pendingProtectionRequests.length > 0) {
        mergeOtherRequest(mergedRequest, pendingProtectionRequests[0]);
    } else if(rejectedProtectionRequests.length > 1) {
        mergeOtherRequest(mergedRequest, rejectedProtectionRequests[1]);
    }
    return [ mergedRequest ];
}
