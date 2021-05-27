import React, { useState, useContext, useEffect, useCallback } from 'react';

import { TokenizationRequest, fetchRequests, rejectRequest as modelRejectRequest } from './Model';
import { sign } from '../logion-chain';

export interface LegalOfficerContext {
    legalOfficerAddress: string,
    pendingTokenizationRequests: TokenizationRequest[] | null,
    rejectRequest: ((requestId: string, reason: string) => Promise<void>) | null,
    rejectedTokenizationRequests: TokenizationRequest[] | null,
    refreshRequests: (() => void) | null,
}

function initialContextValue(legalOfficerAddress: string): LegalOfficerContext {
    return {
        legalOfficerAddress,
        pendingTokenizationRequests: null,
        rejectRequest: null,
        rejectedTokenizationRequests: null,
        refreshRequests: null,
    };
}

const LegalOfficerContextObject: React.Context<LegalOfficerContext> = React.createContext(initialContextValue(""));

export interface Props {
    legalOfficerAddress: string,
    children: JSX.Element | JSX.Element[] | null
}

export function LegalOfficerContextProvider(props: Props) {
    const [contextValue, setContextValue] = useState<LegalOfficerContext>(initialContextValue(props.legalOfficerAddress));

    const refreshPendingRequests = useCallback(() => {
        async function fetchAndSetPendingRequests() {
            const pendingTokenizationRequests = await fetchRequests({
                legalOfficerAddress: contextValue.legalOfficerAddress,
                status: "PENDING",
            });
            setContextValue({ ...contextValue, pendingTokenizationRequests });
        };
        fetchAndSetPendingRequests();
    }, [contextValue, setContextValue]);

    const refreshRejectedRequests = useCallback(() => {
        async function fetchAndSetRejectedRequests() {
            const rejectedTokenizationRequests = await fetchRequests({
                legalOfficerAddress: contextValue.legalOfficerAddress,
                status: "REJECTED",
            });
            setContextValue({ ...contextValue, rejectedTokenizationRequests });
        };
        fetchAndSetRejectedRequests();
    }, [contextValue, setContextValue]);

    const refreshRequests = useCallback(() => {
        async function fetchAndSetAll() {
            const pendingTokenizationRequests = await fetchRequests({
                legalOfficerAddress: contextValue.legalOfficerAddress,
                status: "PENDING",
            });
            const rejectedTokenizationRequests = await fetchRequests({
                legalOfficerAddress: contextValue.legalOfficerAddress,
                status: "REJECTED",
            });
            setContextValue({ ...contextValue, pendingTokenizationRequests, rejectedTokenizationRequests });
        };
        fetchAndSetAll();
    }, [contextValue, setContextValue]);

    useEffect(() => {
        if(contextValue.rejectRequest === null) {
            const rejectRequest = async (requestId: string, rejectReason: string): Promise<void> => {
                const attributes = [
                    `${contextValue.legalOfficerAddress}`,
                    `${requestId}`,
                    `${rejectReason}`
                ];
                const signature = await sign({
                    signerId: contextValue.legalOfficerAddress,
                    attributes
                });
                await modelRejectRequest({
                    legalOfficerAddress: contextValue.legalOfficerAddress,
                    requestId,
                    signature,
                    rejectReason,
                });
                refreshRequests();
            };
            setContextValue({...contextValue, rejectRequest});
        }
    }, [refreshRequests, contextValue, setContextValue]);

    useEffect(() => {
        if(contextValue.refreshRequests === null) {
            setContextValue({...contextValue, refreshRequests});
        }
    }, [refreshRequests, contextValue, setContextValue]);

    useEffect(() => {
        if(contextValue.pendingTokenizationRequests === null) {
            refreshPendingRequests();
        }
    }, [refreshPendingRequests, contextValue, setContextValue]);

    useEffect(() => {
        if(contextValue.rejectedTokenizationRequests === null) {
            refreshRejectedRequests();
        }
    }, [refreshRejectedRequests, contextValue, setContextValue]);

    return (
        <LegalOfficerContextObject.Provider value={contextValue}>
            {props.children}
        </LegalOfficerContextObject.Provider>
    );
}

export function useLegalOfficerContext(): LegalOfficerContext {
    return { ...useContext(LegalOfficerContextObject) };
}
