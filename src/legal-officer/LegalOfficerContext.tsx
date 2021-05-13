import React, { useState, useContext, useEffect, useCallback } from 'react';

import { TokenizationRequest, FetchRequestSpecification, fetchRequests, rejectRequest as modelRejectRequest } from './Model';

export interface LegalOfficerContext {
    legalOfficerAddress: string,
    pendingTokenizationRequests: TokenizationRequest[] | null,
    rejectRequest: ((requestId: string) => Promise<void>) | null,
}

function initialContextValue(legalOfficerAddress: string): LegalOfficerContext {
    return {
        legalOfficerAddress,
        pendingTokenizationRequests: null,
        rejectRequest: null
    };
}

const LegalOfficerContextObject: React.Context<LegalOfficerContext> = React.createContext(initialContextValue(""));

export interface Props {
    legalOfficerAddress: string,
    children: JSX.Element | JSX.Element[] | null
}

export function LegalOfficerContextProvider(props: Props) {
    const [contextValue, setContextValue] = useState<LegalOfficerContext>(initialContextValue(props.legalOfficerAddress));

    const refreshRequests = useCallback(() => {
        async function fetchAndSet(specification: FetchRequestSpecification) {
            const pendingTokenizationRequests = await fetchRequests(specification);
            setContextValue({ ...contextValue, pendingTokenizationRequests });
        };

        const specification: FetchRequestSpecification = {
            legalOfficerAddress: contextValue.legalOfficerAddress,
            status: "PENDING",
        };
        fetchAndSet(specification);
    }, [contextValue, setContextValue]);

    useEffect(() => {
        if(contextValue.rejectRequest === null) {
            const rejectRequest = async (requestId: string): Promise<void> => {
                await modelRejectRequest(requestId);
                refreshRequests();
            };
            setContextValue({...contextValue, rejectRequest});
        }
    }, [refreshRequests, contextValue, setContextValue]);

    useEffect(() => {
        if(contextValue.pendingTokenizationRequests === null) {
            refreshRequests();
        }
    }, [refreshRequests, contextValue, setContextValue]);

    return (
        <LegalOfficerContextObject.Provider value={contextValue}>
            {props.children}
        </LegalOfficerContextObject.Provider>
    );
}

export function useLegalOfficerContext(): LegalOfficerContext {
    return { ...useContext(LegalOfficerContextObject) };
}
