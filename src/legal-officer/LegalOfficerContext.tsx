import React, { useContext, useEffect, useReducer, useCallback, Reducer } from 'react';
import { AxiosInstance } from 'axios';

import { TokenizationRequest, ProtectionRequest, } from '../common/types/ModelTypes';
import { fetchRequests, fetchProtectionRequests, } from '../common/Model';
import { rejectRequest as modelRejectRequest, } from './Model';
import { useCommonContext } from '../common/CommonContext';
import { LIGHT_MODE } from './Types';

export interface LegalOfficerContext {
    rejectRequest: ((requestId: string, reason: string) => Promise<void>) | null,
    pendingTokenizationRequests: TokenizationRequest[] | null,
    tokenizationRequestsHistory: TokenizationRequest[] | null,
    refreshRequests: ((clearBeforeRefresh: boolean) => void) | null,
    pendingProtectionRequests: ProtectionRequest[] | null,
    activatedProtectionRequests: ProtectionRequest[] | null,
    protectionRequestsHistory: ProtectionRequest[] | null,
    pendingRecoveryRequests: ProtectionRequest[] | null,
    recoveryRequestsHistory: ProtectionRequest[] | null,
}

interface FullLegalOfficerContext extends LegalOfficerContext {
    currentAxios?: AxiosInstance;
    dataAddress: string | null;
    fetchForAddress: string | null;
}

function initialContextValue(): FullLegalOfficerContext {
    return {
        dataAddress: null,
        fetchForAddress: null,
        rejectRequest: null,
        pendingTokenizationRequests: null,
        tokenizationRequestsHistory: null,
        refreshRequests: null,
        pendingProtectionRequests: null,
        activatedProtectionRequests: null,
        protectionRequestsHistory: null,
        pendingRecoveryRequests: null,
        recoveryRequestsHistory: null,
    };
}

const LegalOfficerContextObject: React.Context<FullLegalOfficerContext> = React.createContext(initialContextValue());

type ActionType = 'FETCH_IN_PROGRESS'
    | 'SET_DATA'
    | 'SET_REFRESH_REQUESTS_FUNCTION'
    | 'SET_CURRENT_AXIOS'
    | 'SET_REJECT_REQUEST'
;

interface Action {
    type: ActionType;
    dataAddress?: string;
    pendingTokenizationRequests?: TokenizationRequest[];
    tokenizationRequestsHistory?: TokenizationRequest[];
    pendingProtectionRequests?: ProtectionRequest[];
    protectionRequestsHistory?: ProtectionRequest[];
    activatedProtectionRequests?: ProtectionRequest[];
    pendingRecoveryRequests?: ProtectionRequest[],
    recoveryRequestsHistory?: ProtectionRequest[],
    refreshRequests?: (clearBeforeRefresh: boolean) => void;
    clearBeforeRefresh?: boolean;
    axios?: AxiosInstance;
    rejectRequest?: ((requestId: string, reason: string) => Promise<void>) | null;
}

const reducer: Reducer<FullLegalOfficerContext, Action> = (state: FullLegalOfficerContext, action: Action): FullLegalOfficerContext => {
    switch (action.type) {
        case 'FETCH_IN_PROGRESS':
            console.log("fetch in progress for " + action.dataAddress!);
            if(action.clearBeforeRefresh!) {
                return {
                    ...state,
                    fetchForAddress: action.dataAddress!,
                    pendingTokenizationRequests: null,
                    tokenizationRequestsHistory: null,
                    pendingProtectionRequests: null,
                    protectionRequestsHistory: null,
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
                    pendingTokenizationRequests: action.pendingTokenizationRequests!,
                    tokenizationRequestsHistory: action.tokenizationRequestsHistory!,
                    pendingProtectionRequests: action.pendingProtectionRequests!,
                    protectionRequestsHistory: action.protectionRequestsHistory!,
                    activatedProtectionRequests: action.activatedProtectionRequests!,
                    pendingRecoveryRequests: action.pendingRecoveryRequests!,
                    recoveryRequestsHistory: action.recoveryRequestsHistory!,
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
        case "SET_CURRENT_AXIOS":
            return {
                ...state,
                currentAxios: action.axios!,
            };
        case "SET_REJECT_REQUEST":
            return {
                ...state,
                rejectRequest: action.rejectRequest!,
            };
        default:
            /* istanbul ignore next */
            throw new Error(`Unknown type: ${action.type}`);
    }
}

export interface Props {
    children: JSX.Element | JSX.Element[] | null
}

export function LegalOfficerContextProvider(props: Props) {
    const { accounts, colorTheme, setColorTheme, axios } = useCommonContext();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue());

    useEffect(() => {
        if(colorTheme !== LIGHT_MODE && setColorTheme !== null) {
            setColorTheme(LIGHT_MODE);
        }
    }, [ colorTheme, setColorTheme ]);

    const refreshRequests = useCallback((clearBeforeRefresh: boolean) => {
        const currentAddress = accounts!.current!.address;
        dispatch({
            type: "FETCH_IN_PROGRESS",
            dataAddress: currentAddress,
            clearBeforeRefresh,
        });

        (async function() {
            const pendingTokenizationRequests = await fetchRequests(axios!, {
                legalOfficerAddress: currentAddress,
                status: "PENDING",
            });
            const acceptedTokenizationRequests = await fetchRequests(axios!, {
                legalOfficerAddress: currentAddress,
                status: "ACCEPTED",
            });
            const rejectedTokenizationRequests = await fetchRequests(axios!, {
                legalOfficerAddress: currentAddress,
                status: "REJECTED",
            });

            const pendingProtectionRequests = await fetchProtectionRequests(axios!, {
                legalOfficerAddress: currentAddress,
                decisionStatuses: ["PENDING"],
                kind: 'PROTECTION_ONLY',
            });
            const activatedProtectionRequests = await fetchProtectionRequests(axios!, {
                legalOfficerAddress: currentAddress,
                decisionStatuses: ["ACCEPTED"],
                kind: 'ANY',
                protectionRequestStatus: "ACTIVATED"
            });
            const protectionRequestsHistory = await fetchProtectionRequests(axios!, {
                legalOfficerAddress: currentAddress,
                decisionStatuses: ["ACCEPTED", "REJECTED"],
                kind: 'PROTECTION_ONLY',
            });

            const pendingRecoveryRequests = await fetchProtectionRequests(axios!, {
                legalOfficerAddress: currentAddress,
                decisionStatuses: ["PENDING"],
                kind: 'RECOVERY',
            });
            const recoveryRequestsHistory = await fetchProtectionRequests(axios!, {
                legalOfficerAddress: currentAddress,
                decisionStatuses: ["ACCEPTED", "REJECTED"],
                kind: 'RECOVERY',
            });

            dispatch({
                type: "SET_DATA",
                pendingTokenizationRequests,
                tokenizationRequestsHistory: acceptedTokenizationRequests.concat(rejectedTokenizationRequests),
                pendingProtectionRequests,
                activatedProtectionRequests,
                protectionRequestsHistory,
                dataAddress: currentAddress,
                pendingRecoveryRequests,
                recoveryRequestsHistory,
            });
        })();
    }, [ accounts, axios, dispatch ]);

    useEffect(() => {
        if(contextValue.currentAxios !== axios) {
            const rejectRequest = async (requestId: string, rejectReason: string): Promise<void> => {
                await modelRejectRequest(axios!, {
                    requestId,
                    rejectReason,
                });
                refreshRequests(false);
            };

            dispatch({
                type: 'SET_REJECT_REQUEST',
                rejectRequest
            });
        }
    }, [ axios, accounts, refreshRequests, contextValue, dispatch ]);

    useEffect(() => {
        if(contextValue.refreshRequests !== refreshRequests) {
            dispatch({
                type: 'SET_REFRESH_REQUESTS_FUNCTION',
                refreshRequests
            });
        }
    }, [ refreshRequests, contextValue, dispatch ]);

    useEffect(() => {
        if(accounts !== null
                && accounts.current !== undefined
                && contextValue.dataAddress !== accounts.current.address
                && contextValue.fetchForAddress !== accounts.current.address) {
            refreshRequests(true);
        }
    }, [ contextValue, accounts, refreshRequests ]);

    useEffect(() => {
        if(axios !== contextValue.currentAxios) {
            dispatch({
                type: 'SET_CURRENT_AXIOS',
               axios
            })
        }
    }, [ axios, contextValue, dispatch ]);

    return (
        <LegalOfficerContextObject.Provider value={contextValue}>
            {props.children}
        </LegalOfficerContextObject.Provider>
    );
}

export function useLegalOfficerContext(): LegalOfficerContext {
    return { ...useContext(LegalOfficerContextObject) };
}
