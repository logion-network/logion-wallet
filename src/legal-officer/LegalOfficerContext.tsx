import React, { useContext, useEffect, useReducer, Reducer } from 'react';
import { AxiosInstance } from 'axios';

import { ProtectionRequest, } from '../common/types/ModelTypes';
import { fetchProtectionRequests, } from '../common/Model';
import { useCommonContext } from '../common/CommonContext';
import { LIGHT_MODE } from './Types';
import { AxiosFactory } from '../common/api';

export interface LegalOfficerContext {
    refreshRequests: ((clearBeforeRefresh: boolean) => void) | null,
    pendingProtectionRequests: ProtectionRequest[] | null,
    activatedProtectionRequests: ProtectionRequest[] | null,
    protectionRequestsHistory: ProtectionRequest[] | null,
    pendingRecoveryRequests: ProtectionRequest[] | null,
    recoveryRequestsHistory: ProtectionRequest[] | null,
    axios?: AxiosInstance;
}

interface FullLegalOfficerContext extends LegalOfficerContext {
    dataAddress: string | null;
    fetchForAddress: string | null;
}

function initialContextValue(): FullLegalOfficerContext {
    return {
        dataAddress: null,
        fetchForAddress: null,
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
    | 'SET_CURRENT_USER'
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
}

const reducer: Reducer<FullLegalOfficerContext, Action> = (state: FullLegalOfficerContext, action: Action): FullLegalOfficerContext => {
    switch (action.type) {
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
                };
            } else {
                return state;
            }
        case "SET_CURRENT_USER": {
            return {
                ...state,
                refreshRequests: action.refreshRequests!,
                axios: action.axios!,
            };
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
    const { accounts, colorTheme, setColorTheme, axiosFactory } = useCommonContext();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue());

    useEffect(() => {
        if(colorTheme !== LIGHT_MODE && setColorTheme !== null) {
            setColorTheme(LIGHT_MODE);
        }
    }, [ colorTheme, setColorTheme ]);

    useEffect(() => {
        if(accounts !== null
                && axiosFactory !== undefined
                && accounts.current !== undefined
                && contextValue.dataAddress !== accounts.current.address
                && contextValue.fetchForAddress !== accounts.current.address) {
            const currentAccount = accounts!.current!.address;
            const refreshRequests = (clear: boolean) => refreshRequestsFunction(clear, currentAccount, dispatch, axiosFactory);
            dispatch({
                type: 'SET_CURRENT_USER',
               axios: axiosFactory(currentAccount),
               currentAccount,
               refreshRequests,
            });
            refreshRequests(true);
        }
    }, [ contextValue, axiosFactory, accounts ]);

    return (
        <LegalOfficerContextObject.Provider value={contextValue}>
            {props.children}
        </LegalOfficerContextObject.Provider>
    );
}

export function useLegalOfficerContext(): LegalOfficerContext {
    return { ...useContext(LegalOfficerContextObject) };
}

function refreshRequestsFunction(clearBeforeRefresh: boolean, currentAddress: string, dispatch: React.Dispatch<Action>, axiosFactory: AxiosFactory) {
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
            statuses: ["ACCEPTED", "REJECTED", "ACTIVATED"],
            kind: 'PROTECTION_ONLY',
        });

        const pendingRecoveryRequests = await fetchProtectionRequests(axios, {
            statuses: ["PENDING"],
            kind: 'RECOVERY',
        });
        const recoveryRequestsHistory = await fetchProtectionRequests(axios, {
            statuses: ["ACCEPTED", "REJECTED", "ACTIVATED"],
            kind: 'RECOVERY',
        });

        dispatch({
            type: "SET_DATA",
            pendingProtectionRequests,
            activatedProtectionRequests,
            protectionRequestsHistory,
            dataAddress: currentAddress,
            pendingRecoveryRequests,
            recoveryRequestsHistory,
        });
    })();
}