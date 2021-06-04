import React, { useContext, useEffect, useState, useCallback } from "react";
import { CreateTokenRequest, createTokenRequest as modelCreateTokenRequest } from "./Model";
import { TokenizationRequest, fetchRequests } from "../legal-officer/Model";
import {
    CreateProtectionRequest,
    createProtectionRequest as modelCreateProtectionRequest,
    ProtectionRequest,
    fetchProtectionRequest
} from "./trust-protection/Model";

export interface UserContext {
    legalOfficerAddress: string,
    userAddress: string,
    createTokenRequest: ((request: CreateTokenRequest) => Promise<TokenizationRequest>) | null,
    createdTokenRequest: TokenizationRequest | null,
    pendingTokenizationRequests: TokenizationRequest[] | null,
    acceptedTokenizationRequests: TokenizationRequest[] | null,
    rejectedTokenizationRequests: TokenizationRequest[] | null,
    refreshRequests: (() => void) | null,
    createProtectionRequest: ((request: CreateProtectionRequest) => Promise<ProtectionRequest>) | null,
    createdProtectionRequest: ProtectionRequest | null,
}

function initialContextValue(legalOfficerAddress: string, userAddress: string): UserContext {
    return {
        legalOfficerAddress,
        userAddress,
        createTokenRequest: null,
        createdTokenRequest: null,
        pendingTokenizationRequests: null,
        acceptedTokenizationRequests: null,
        rejectedTokenizationRequests: null,
        refreshRequests: null,
        createProtectionRequest: null,
        createdProtectionRequest: null,
    }
}

const UserContextObject: React.Context<UserContext> = React.createContext(initialContextValue("", ""));

export interface Props {
    legalOfficerAddress: string,
    userAddress: string,
    children: JSX.Element | JSX.Element[] | null
}

export function UserContextProvider(props: Props) {
    const [contextValue, setContextValue] = useState<UserContext>(initialContextValue(props.legalOfficerAddress, props.userAddress));
    const [fetchedInitially, setFetchedInitially] = useState<boolean>(false);

    useEffect(() => {
        if (contextValue.createTokenRequest === null) {
            const createTokenRequest = async (request: CreateTokenRequest): Promise<TokenizationRequest> => {
                const createdTokenRequest = await modelCreateTokenRequest(request);
                setContextValue({...contextValue, createdTokenRequest})
                return createdTokenRequest;
            }
            setContextValue({...contextValue, createTokenRequest});
        }
    }, [contextValue, setContextValue]);

    const refreshRequests = useCallback(() => {
        async function fetchAndSetRequests() {
            const pendingTokenizationRequests = await fetchRequests({
                requesterAddress: contextValue.userAddress,
                status: "PENDING",
            });
            const acceptedTokenizationRequests = await fetchRequests({
                requesterAddress: contextValue.userAddress,
                status: "ACCEPTED",
            });
            const rejectedTokenizationRequests = await fetchRequests({
                requesterAddress: contextValue.userAddress,
                status: "REJECTED",
            });
            const createdProtectionRequest = await fetchProtectionRequest(contextValue.userAddress);

            setContextValue({
                ...contextValue,
                pendingTokenizationRequests,
                acceptedTokenizationRequests,
                rejectedTokenizationRequests,
                createdProtectionRequest
            });
        }
        fetchAndSetRequests();
    }, [contextValue, setContextValue]);

    useEffect(() => {
        if(!fetchedInitially) {
            setFetchedInitially(true);
            refreshRequests();
        }
    }, [fetchedInitially, refreshRequests]);

    useEffect(() => {
        if(contextValue.refreshRequests === null) {
            setContextValue({...contextValue, refreshRequests});
        }
    }, [refreshRequests, contextValue, setContextValue]);

    useEffect(() => {
        if (contextValue.createProtectionRequest === null) {
            const createProtectionRequest = async (request: CreateProtectionRequest): Promise<ProtectionRequest> => {
                const createdProtectionRequest = await modelCreateProtectionRequest(request);
                setContextValue({...contextValue, createdProtectionRequest})
                return createdProtectionRequest;
            }
            setContextValue({...contextValue, createProtectionRequest});
        }
    }, [contextValue, setContextValue]);

    return (
        <UserContextObject.Provider value={contextValue}>
            {props.children}
        </UserContextObject.Provider>
    );
}

export function useUserContext(): UserContext {
    return {...useContext(UserContextObject)};
}
