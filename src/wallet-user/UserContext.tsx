import React, {useContext, useEffect, useState} from "react";
import {CreateTokenRequest, createTokenRequest as modelCreateTokenRequest} from "./Model";
import {TokenizationRequest} from "../legal-officer/Model";

export interface UserContext {
    legalOfficerAddress: string,
    userAddress: string,
    createTokenRequest: ((request: CreateTokenRequest) => Promise<TokenizationRequest>) | null,
    createdTokenRequest: TokenizationRequest | null
}

function initialContextValue(legalOfficerAddress: string, userAddress: string): UserContext {
    return {
        legalOfficerAddress,
        userAddress,
        createTokenRequest: null,
        createdTokenRequest: null
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
    }, [contextValue, setContextValue])
    return (
        <UserContextObject.Provider value={contextValue}>
            {props.children}
        </UserContextObject.Provider>
    );
}

export function useUserContext(): UserContext {
    return {...useContext(UserContextObject)};
}
