import React, { useContext, useEffect, useState, useCallback } from "react";
import { Option } from '@polkadot/types';

import { useLogionChain } from '../logion-chain';
import { RecoveryConfig, getRecoveryConfig } from '../logion-chain/Recovery';
import { Children } from '../component/types/Helpers';

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
import { useRootContext } from '../RootContext';

export interface UserContext {
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
    colorTheme: ColorTheme,
}

function initialContextValue(): UserContext {
    return {
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
        colorTheme: {
            dashboard: {
                background: '#152665',
                foreground: '#000000',
            },
            menuArea: {
                background: '#152665',
                foreground: '#ffffff',
                logoShadow: '#3b6cf433',
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
                foreground: '#000000',
                background: '#ffffff',
            },
            frame: {
                background: '#3b6cf40f',
                foreground: '#000000',
            },
            topMenu: {
                iconGradient: {
                    from: '#3b6cf4',
                    to: '#6050dc',
                }
            },
            bottomMenu: {
                iconGradient: {
                    from: '#7a90cb',
                    to: '#3b6cf4',
                }
            }
        },
    }
}

const UserContextObject: React.Context<UserContext> = React.createContext(initialContextValue());

export interface Props {
    children: Children
}

export function UserContextProvider(props: Props) {
    const { currentAddress } = useRootContext();
    const { api, apiState } = useLogionChain();
    const [contextValue, setContextValue] = useState<UserContext>(initialContextValue());
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
                requesterAddress: currentAddress,
                status: "PENDING",
            });
            const acceptedTokenizationRequests = await fetchRequests({
                requesterAddress: currentAddress,
                status: "ACCEPTED",
            });
            const rejectedTokenizationRequests = await fetchRequests({
                requesterAddress: currentAddress,
                status: "REJECTED",
            });
            const pendingProtectionRequests = await fetchProtectionRequests({
                requesterAddress: currentAddress,
                statuses: [ "PENDING" ],
            });
            const acceptedProtectionRequests = await fetchProtectionRequests({
                requesterAddress: currentAddress,
                statuses: [ "ACCEPTED" ],
            });
            const rejectedProtectionRequests = await fetchProtectionRequests({
                requesterAddress: currentAddress,
                statuses: [ "REJECTED" ],
            });
            console.log(currentAddress);
            const recoveryConfig = await getRecoveryConfig({
                api: api!,
                accountId: currentAddress
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
    }, [ api, contextValue, setContextValue, currentAddress ]);

    useEffect(() => {
        if(apiState === "READY" && !fetchedInitially && currentAddress !== '') {
            setFetchedInitially(true);
            refreshRequests();
        }
    }, [ apiState, fetchedInitially, refreshRequests, currentAddress ]);

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

    return (
        <UserContextObject.Provider value={contextValue}>
            {props.children}
        </UserContextObject.Provider>
    );
}

export function useUserContext(): UserContext {
    return {...useContext(UserContextObject)};
}
