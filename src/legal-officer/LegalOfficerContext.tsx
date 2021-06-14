import React, { useState, useContext, useEffect, useCallback } from 'react';
import moment from 'moment';

import {
    TokenizationRequest,
    ProtectionRequest,
} from './Types';
import {
    fetchRequests,
    rejectRequest as modelRejectRequest,
    fetchProtectionRequests,
} from './Model';
import { sign } from '../logion-chain';

export interface LegalOfficerContext {
    legalOfficerAddress: string,
    rejectRequest: ((requestId: string, reason: string) => Promise<void>) | null,
    pendingTokenizationRequests: TokenizationRequest[] | null,
    acceptedTokenizationRequests: TokenizationRequest[] | null,
    rejectedTokenizationRequests: TokenizationRequest[] | null,
    refreshRequests: (() => void) | null,
    pendingProtectionRequests: ProtectionRequest[] | null,
    protectionRequestsHistory: ProtectionRequest[] | null,
}

function initialContextValue(legalOfficerAddress: string): LegalOfficerContext {
    return {
        legalOfficerAddress,
        rejectRequest: null,
        pendingTokenizationRequests: null,
        acceptedTokenizationRequests: null,
        rejectedTokenizationRequests: null,
        refreshRequests: null,
        pendingProtectionRequests: null,
        protectionRequestsHistory: null,
    };
}

const LegalOfficerContextObject: React.Context<LegalOfficerContext> = React.createContext(initialContextValue(""));

export interface Props {
    legalOfficerAddress: string,
    children: JSX.Element | JSX.Element[] | null
}

export function LegalOfficerContextProvider(props: Props) {
    const [contextValue, setContextValue] = useState<LegalOfficerContext>(initialContextValue(props.legalOfficerAddress));
    const [fetchedInitially, setFetchedInitially] = useState<boolean>(false);

    const refreshRequests = useCallback(() => {
        async function fetchAndSetAll() {
            const pendingTokenizationRequests = await fetchRequests({
                legalOfficerAddress: contextValue.legalOfficerAddress,
                status: "PENDING",
            });
            const acceptedTokenizationRequests = await fetchRequests({
                legalOfficerAddress: contextValue.legalOfficerAddress,
                status: "ACCEPTED",
            });
            const rejectedTokenizationRequests = await fetchRequests({
                legalOfficerAddress: contextValue.legalOfficerAddress,
                status: "REJECTED",
            });
            const pendingProtectionRequests = await fetchProtectionRequests({
                legalOfficerAddress: contextValue.legalOfficerAddress,
                statuses: ["PENDING"],
            });
            const protectionRequestsHistory = await fetchProtectionRequests({
                legalOfficerAddress: contextValue.legalOfficerAddress,
                statuses: ["ACCEPTED", "REJECTED"],
            });
            setContextValue({
                ...contextValue,
                pendingTokenizationRequests,
                acceptedTokenizationRequests,
                rejectedTokenizationRequests,
                pendingProtectionRequests,
                protectionRequestsHistory,
            });
        };
        fetchAndSetAll();
    }, [contextValue, setContextValue]);

    useEffect(() => {
        if(contextValue.rejectRequest === null) {
            const rejectRequest = async (requestId: string, rejectReason: string): Promise<void> => {
                const attributes = [
                    `${requestId}`,
                    `${rejectReason}`
                ];
                const signedOn = moment();
                const signature = await sign({
                    signerId: contextValue.legalOfficerAddress,
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
    }, [refreshRequests, contextValue, setContextValue]);

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

    return (
        <LegalOfficerContextObject.Provider value={contextValue}>
            {props.children}
        </LegalOfficerContextObject.Provider>
    );
}

export function useLegalOfficerContext(): LegalOfficerContext {
    return { ...useContext(LegalOfficerContextObject) };
}
