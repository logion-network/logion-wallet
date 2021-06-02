import React, { useContext, useEffect, useState, useCallback } from "react";
import { CreateTokenRequest, createTokenRequest as modelCreateTokenRequest } from "./Model";
import { TokenizationRequest, fetchRequests } from "../legal-officer/Model";

export interface UserContext {
    legalOfficerAddress: string,
    userAddress: string,
    createTokenRequest: ((request: CreateTokenRequest) => Promise<TokenizationRequest>) | null,
    createdTokenRequest: TokenizationRequest | null,
    pendingTokenizationRequests: TokenizationRequest[] | null,
    acceptedTokenizationRequests: TokenizationRequest[] | null,
    rejectedTokenizationRequests: TokenizationRequest[] | null,
    refreshRequests: (() => void) | null,
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
        async function fetchAndSetAcceptedRequests() {
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
            setContextValue({
                ...contextValue,
                pendingTokenizationRequests,
                acceptedTokenizationRequests,
                rejectedTokenizationRequests,
            });
        };
        fetchAndSetAcceptedRequests();
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

    return (
        <UserContextObject.Provider value={contextValue}>
            {props.children}
        </UserContextObject.Provider>
    );
}

export function useUserContext(): UserContext {
    return {...useContext(UserContextObject)};
}
