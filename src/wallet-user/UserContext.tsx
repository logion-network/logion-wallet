import React, { useContext, useEffect, useState, useCallback } from "react";
import { CreateTokenRequest, createTokenRequest as modelCreateTokenRequest } from "./Model";
import { TokenizationRequest, fetchRequests } from "../legal-officer/Model";

export interface UserContext {
    legalOfficerAddress: string,
    userAddress: string,
    createTokenRequest: ((request: CreateTokenRequest) => Promise<TokenizationRequest>) | null,
    createdTokenRequest: TokenizationRequest | null,
    rejectedTokenizationRequests: TokenizationRequest[] | null,
    refreshRejectedRequests: (() => void) | null,
}

function initialContextValue(legalOfficerAddress: string, userAddress: string): UserContext {
    return {
        legalOfficerAddress,
        userAddress,
        createTokenRequest: null,
        createdTokenRequest: null,
        rejectedTokenizationRequests: null,
        refreshRejectedRequests: null,
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

    const refreshRejectedRequests = useCallback(() => {
        async function fetchAndSetRejectedRequests() {
            const rejectedTokenizationRequests = await fetchRequests({
                requesterAddress: contextValue.userAddress,
                status: "REJECTED",
            });
            setContextValue({ ...contextValue, rejectedTokenizationRequests });
        };
        fetchAndSetRejectedRequests();
    }, [contextValue, setContextValue]);

    useEffect(() => {
        if(contextValue.rejectedTokenizationRequests === null) {
            refreshRejectedRequests();
        }
    }, [refreshRejectedRequests, contextValue, setContextValue]);

    useEffect(() => {
        if(contextValue.refreshRejectedRequests === null) {
            setContextValue({...contextValue, refreshRejectedRequests});
        }
    }, [refreshRejectedRequests, contextValue, setContextValue]);

    return (
        <UserContextObject.Provider value={contextValue}>
            {props.children}
        </UserContextObject.Provider>
    );
}

export function useUserContext(): UserContext {
    return {...useContext(UserContextObject)};
}
