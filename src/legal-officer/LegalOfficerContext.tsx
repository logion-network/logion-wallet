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
import { ColorTheme } from '../component/ColorTheme';
import { useRootContext } from '../RootContext';

export interface LegalOfficerContext {
    dataAddress: string | null,
    rejectRequest: ((requestId: string, reason: string) => Promise<void>) | null,
    pendingTokenizationRequests: TokenizationRequest[] | null,
    acceptedTokenizationRequests: TokenizationRequest[] | null,
    rejectedTokenizationRequests: TokenizationRequest[] | null,
    refreshRequests: (() => void) | null,
    pendingProtectionRequests: ProtectionRequest[] | null,
    protectionRequestsHistory: ProtectionRequest[] | null,
    colorTheme: ColorTheme,
}

function initialContextValue(legalOfficerAddress: string): LegalOfficerContext {
    return {
        dataAddress: null,
        rejectRequest: null,
        pendingTokenizationRequests: null,
        acceptedTokenizationRequests: null,
        rejectedTokenizationRequests: null,
        refreshRequests: null,
        pendingProtectionRequests: null,
        protectionRequestsHistory: null,
        colorTheme: {
            type: 'dark',
            shadowColor: '#3b6cf419',
            dashboard: {
                background: '#141b2d',
                foreground: '#ffffff',
            },
            menuArea: {
                background: '#3b6cf40f',
                foreground: '#ffffff',
            },
            accounts: {
                iconBackground: '#3b6cf4',
                hintColor: '#ffffff66',
                foreground: '#ffffff',
                background: '#141b2d',
                legalOfficerIcon: {
                    category: 'legal-officer',
                    id: 'account-shield'
                }
            },
            frame: {
                background: '#1f2a40',
                foreground: '#ffffff',
                link: '#ffffff',
            },
            topMenuItems: {
                iconGradient: {
                    from: '#3b6cf4',
                    to: '#6050dc',
                }
            },
            bottomMenuItems: {
                iconGradient: {
                    from: '#7a90cb',
                    to: '#3b6cf4',
                }
            }
        },
    };
}

const LegalOfficerContextObject: React.Context<LegalOfficerContext> = React.createContext(initialContextValue(""));

export interface Props {
    legalOfficerAddress: string,
    children: JSX.Element | JSX.Element[] | null
}

export function LegalOfficerContextProvider(props: Props) {
    const { currentAddress } = useRootContext();
    const [ contextValue, setContextValue ] = useState<LegalOfficerContext>(initialContextValue(props.legalOfficerAddress));
    const [ fetchedInitially, setFetchedInitially ] = useState<boolean>(false);
    const [ refreshing, setRefreshing ] = useState<boolean>(false);

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
                statuses: ["PENDING"],
            });
            const protectionRequestsHistory = await fetchProtectionRequests({
                legalOfficerAddress: currentAddress,
                statuses: ["ACCEPTED", "REJECTED"],
            });

            setRefreshing(false);
            setContextValue({
                ...contextValue,
                pendingTokenizationRequests,
                acceptedTokenizationRequests,
                rejectedTokenizationRequests,
                pendingProtectionRequests,
                protectionRequestsHistory,
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
