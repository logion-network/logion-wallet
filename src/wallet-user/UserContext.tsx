import React, { useContext, useEffect, useState, useCallback } from "react";
import { Option } from '@polkadot/types';

import { useLogionChain } from '../logion-chain';
import { RecoveryConfig, getRecoveryConfig } from '../logion-chain/Recovery';

import { CreateTokenRequest, createTokenRequest as modelCreateTokenRequest } from "./Model";
import { TokenizationRequest } from "../legal-officer/Types";
import { fetchRequests, fetchProtectionRequests } from "../legal-officer/Model";
import {
    ProtectionRequest,
} from "../legal-officer/Types";
import {
    CreateProtectionRequest,
    createProtectionRequest as modelCreateProtectionRequest,
} from "./trust-protection/Model";
import { ColorTheme } from '../component/Dashboard';
import Addresses, { buildAddresses } from '../component/types/Addresses';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

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
    pendingProtectionRequests: ProtectionRequest[] | null,
    acceptedProtectionRequests: ProtectionRequest[] | null,
    rejectedProtectionRequests: ProtectionRequest[] | null,
    recoveryConfig: Option<RecoveryConfig> | null,
    setUserAddress: ((userAddress: string) => void) | null,
    colorTheme: ColorTheme,
    addresses: Addresses | null,
    injectedAccounts: InjectedAccountWithMeta[] | null,
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
        pendingProtectionRequests: null,
        acceptedProtectionRequests: null,
        rejectedProtectionRequests: null,
        recoveryConfig: null,
        setUserAddress: null,
        colorTheme: {
            sidebar: {
                background: '#152665',
                foreground: '#ffffff',
            },
            primaryArea: {
                background: '#ffffff',
                foreground: '#000000',
                link: '#3b6cf466',
            },
            secondaryArea: {
                background: '#ffffff',
                foreground: '#000000',
            },
            accounts: {
                iconBackground: '#3b6cf4',
                hintColor: '#00000066',
                textColor: '#000000',
            },
            frame: {
                background: '#3b6cf40f',
                foreground: '',
            }
        },
        addresses: null,
        injectedAccounts: null,
    }
}

const UserContextObject: React.Context<UserContext> = React.createContext(initialContextValue("", ""));

export interface Props {
    legalOfficerAddress: string,
    userAddress: string,
    children: JSX.Element | JSX.Element[] | null
}

export function UserContextProvider(props: Props) {
    const { api, apiState, injectedAccounts } = useLogionChain();
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
            const pendingProtectionRequests = await fetchProtectionRequests({
                requesterAddress: contextValue.userAddress,
                statuses: [ "PENDING" ],
            });
            const acceptedProtectionRequests = await fetchProtectionRequests({
                requesterAddress: contextValue.userAddress,
                statuses: [ "ACCEPTED" ],
            });
            const rejectedProtectionRequests = await fetchProtectionRequests({
                requesterAddress: contextValue.userAddress,
                statuses: [ "REJECTED" ],
            });
            const recoveryConfig = await getRecoveryConfig({
                api: api!,
                accountId: contextValue.userAddress
            });

            setContextValue({
                ...contextValue,
                pendingTokenizationRequests,
                acceptedTokenizationRequests,
                rejectedTokenizationRequests,
                pendingProtectionRequests,
                acceptedProtectionRequests,
                rejectedProtectionRequests,
                recoveryConfig,
            });
        }
        if(api !== null) {
            fetchAndSetRequests();
        }
    }, [ api, contextValue, setContextValue ]);

    useEffect(() => {
        if(apiState === "READY" && !fetchedInitially) {
            setFetchedInitially(true);
            refreshRequests();
        }
    }, [apiState, fetchedInitially, refreshRequests]);

    useEffect(() => {
        if(contextValue.refreshRequests === null) {
            setContextValue({...contextValue, refreshRequests});
        }
    }, [refreshRequests, contextValue, setContextValue]);

    useEffect(() => {
        if (contextValue.createProtectionRequest === null) {
            const createProtectionRequest = async (request: CreateProtectionRequest): Promise<ProtectionRequest> => {
                const createdProtectionRequest = await modelCreateProtectionRequest(request);
                refreshRequests();
                return createdProtectionRequest;
            }
            setContextValue({...contextValue, createProtectionRequest});
        }
    }, [contextValue, refreshRequests, setContextValue]);

    useEffect(() => {
        if(contextValue.setUserAddress === null) {
            const setUserAddress = (userAddress: string) => {
                setContextValue({...contextValue, userAddress});
                refreshRequests();
            }
            setContextValue({...contextValue, setUserAddress});
        }
    }, [ contextValue, setContextValue, refreshRequests ]);

    useEffect(() => {
        if(contextValue.injectedAccounts !== injectedAccounts
            && injectedAccounts !== null) {
            setContextValue({
                ...contextValue,
                injectedAccounts,
                addresses: buildAddresses(injectedAccounts, contextValue.userAddress)
            });
        }
    }, [ injectedAccounts, contextValue ]);

    return (
        <UserContextObject.Provider value={contextValue}>
            {props.children}
        </UserContextObject.Provider>
    );
}

export function useUserContext(): UserContext {
    return {...useContext(UserContextObject)};
}
