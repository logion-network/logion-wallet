import React, { useState, useContext, useEffect, useCallback } from 'react';
import moment from 'moment';

import {
    TokenizationRequest,
    ProtectionRequest,
} from '../common/types/ModelTypes';
import {
    fetchRequests,
    fetchProtectionRequests,
} from '../common/Model';
import {
    rejectRequest as modelRejectRequest,
} from './Model';
import { sign } from "../logion-chain/Signature";
import { useCommonContext } from '../common/CommonContext';
import { LIGHT_MODE } from './Types';

export interface LegalOfficerContext {
    dataAddress: string | null,
    rejectRequest: ((requestId: string, reason: string) => Promise<void>) | null,
    pendingTokenizationRequests: TokenizationRequest[] | null,
    tokenizationRequestsHistory: TokenizationRequest[] | null,
    refreshRequests: (() => void) | null,
    pendingProtectionRequests: ProtectionRequest[] | null,
    activatedProtectionRequests: ProtectionRequest[] | null,
    protectionRequestsHistory: ProtectionRequest[] | null,
    pendingRecoveryRequests: ProtectionRequest[] | null,
    recoveryRequestsHistory: ProtectionRequest[] | null,
}

function initialContextValue(): LegalOfficerContext {
    return {
        dataAddress: null,
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

const LegalOfficerContextObject: React.Context<LegalOfficerContext> = React.createContext(initialContextValue());

export interface Props {
    children: JSX.Element | JSX.Element[] | null
}

export function LegalOfficerContextProvider(props: Props) {
    const { currentAddress, colorTheme, setColorTheme } = useCommonContext();
    const [ contextValue, setContextValue ] = useState<LegalOfficerContext>(initialContextValue());
    const [ fetchedInitially, setFetchedInitially ] = useState<boolean>(false);
    const [ refreshing, setRefreshing ] = useState<boolean>(false);

    useEffect(() => {
        if(colorTheme !== LIGHT_MODE && setColorTheme !== null) {
            setColorTheme(LIGHT_MODE);
        }
    }, [ colorTheme, setColorTheme ]);

    const refreshRequests = useCallback(() => {
        async function fetchAndSetAll() {
            const pendingTokenizationRequests = await fetchRequests({
                legalOfficerAddress: currentAddress,
                status: "PENDING",
            });
            const acceptedTokenizationRequests = await fetchRequests({
                legalOfficerAddress: currentAddress,
                status: "ACCEPTED",
            });
            const rejectedTokenizationRequests = await fetchRequests({
                legalOfficerAddress: currentAddress,
                status: "REJECTED",
            });

            const pendingProtectionRequests = await fetchProtectionRequests({
                legalOfficerAddress: currentAddress,
                decisionStatuses: ["PENDING"],
                kind: 'PROTECTION_ONLY',
            });
            const activatedProtectionRequests = await fetchProtectionRequests({
                legalOfficerAddress: currentAddress,
                decisionStatuses: ["ACCEPTED"],
                kind: 'ANY',
                protectionRequestStatus: "ACTIVATED"
            });
            const protectionRequestsHistory = await fetchProtectionRequests({
                legalOfficerAddress: currentAddress,
                decisionStatuses: ["ACCEPTED", "REJECTED"],
                kind: 'PROTECTION_ONLY',
            });

            const pendingRecoveryRequests = await fetchProtectionRequests({
                legalOfficerAddress: currentAddress,
                decisionStatuses: ["PENDING"],
                kind: 'RECOVERY',
            });
            const recoveryRequestsHistory = await fetchProtectionRequests({
                legalOfficerAddress: currentAddress,
                decisionStatuses: ["ACCEPTED", "REJECTED"],
                kind: 'RECOVERY',
            });

            setRefreshing(false);
            setContextValue({
                ...contextValue,
                pendingTokenizationRequests,
                tokenizationRequestsHistory: acceptedTokenizationRequests.concat(rejectedTokenizationRequests),
                pendingProtectionRequests,
                activatedProtectionRequests,
                protectionRequestsHistory,
                pendingRecoveryRequests,
                recoveryRequestsHistory,
                dataAddress: currentAddress,
            });
        };
        fetchAndSetAll();
    }, [currentAddress, contextValue, setContextValue]);

    useEffect(() => {
        if(contextValue.rejectRequest === null) {
            const rejectRequest = async (requestId: string, rejectReason: string): Promise<void> => {
                const attributes = [
                    `${requestId}`,
                    `${rejectReason}`
                ];
                const signedOn = moment();
                const signature = await sign({
                    signerId: currentAddress,
                    resource: 'token-request',
                    operation: 'reject',
                    signedOn,
                    attributes
                });
                await modelRejectRequest({
                    requestId,
                    signature,
                    rejectReason,
                    signedOn,
                });
                refreshRequests();
            };
            setContextValue({...contextValue, rejectRequest});
        }
    }, [currentAddress, refreshRequests, contextValue, setContextValue]);

    useEffect(() => {
        if(contextValue.refreshRequests === null) {
            setContextValue({...contextValue, refreshRequests});
        }
    }, [refreshRequests, contextValue, setContextValue]);

    useEffect(() => {
        if(!fetchedInitially) {
            setFetchedInitially(true);
            refreshRequests();
        }
    }, [fetchedInitially, refreshRequests]);

    useEffect(() => {
        if(contextValue.dataAddress !== null && contextValue.dataAddress !== currentAddress && !refreshing) {
            setRefreshing(true);
            refreshRequests();
        }
    }, [ contextValue, currentAddress, refreshRequests, setRefreshing, refreshing ]);

    return (
        <LegalOfficerContextObject.Provider value={contextValue}>
            {props.children}
        </LegalOfficerContextObject.Provider>
    );
}

export function useLegalOfficerContext(): LegalOfficerContext {
    return { ...useContext(LegalOfficerContextObject) };
}
