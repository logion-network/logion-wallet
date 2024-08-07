import { useCallback, useMemo, useState } from 'react';

import Dashboard from '../common/Dashboard';

import LegalOfficerRouter from './LegalOfficerRouter';
import { useCommonContext } from '../common/CommonContext';

import {
    HOME_PATH,
    RECOVERY_REQUESTS_PATH,
    SETTINGS_PATH,
    locRequestsPath,
    VAULT_OUT_REQUESTS_PATH,
    STATEMENT_OF_FACTS_PATH,
    VOTES_PATH,
    transactionsPath,
} from './LegalOfficerPaths';
import { useLegalOfficerContext } from './LegalOfficerContext';
import { useLocation, useNavigate } from 'react-router-dom';
import StatementOfFacts from '../loc/statement/StatementOfFacts';
import { useLogionChain } from '../logion-chain';
import WarningDialog from 'src/common/WarningDialog';
import { MenuItemData } from 'src/common/MenuItem';

export default function LegalOfficerDashboard() {
    const { accounts } = useLogionChain();
    const { colorTheme, refresh, availableLegalOfficers, backendConfig } = useCommonContext();
    const { refreshRequests, missingSettings, refreshLocs, refreshVotes } = useLegalOfficerContext();
    const location = useLocation();
    const [ discardSettings, setDiscardSettings ] = useState(false);
    const navigate = useNavigate();

    const refreshAll = useCallback(() => {
        refresh(false);
        refreshRequests!(false);
        refreshLocs();
        refreshVotes();
    }, [ refresh, refreshRequests, refreshLocs, refreshVotes ]);

    const currentLegalOfficerUnavailable = useMemo(
        () => availableLegalOfficers?.find(node => node.account.equals(accounts?.current?.accountId)) === undefined,
    [ availableLegalOfficers, accounts ]);

    const hasVoteFeature = useMemo(() => {
        return backendConfig(accounts?.current?.accountId).features.vote;
    }, [ accounts, backendConfig ]);

    if(accounts === null || availableLegalOfficers === undefined) {
        return null;
    }

    if(location.pathname.startsWith(STATEMENT_OF_FACTS_PATH)) {
        return <StatementOfFacts />;
    } else {
        const menuTop: MenuItemData[] = [
            {
                id: "home",
                text: "Home",
                to: HOME_PATH,
                exact: true,
                icon: {
                    icon: {
                        id: 'home'
                    },
                    background: colorTheme.topMenuItems.iconGradient,
                },
                onClick: refreshAll,
                disabled: currentLegalOfficerUnavailable,
            },
            {
                id: "wallet",
                text: "Wallet",
                to: transactionsPath("lgnt"),
                exact: false,
                icon: {
                    icon: {
                        id: 'wallet'
                    },
                    background: colorTheme.topMenuItems.iconGradient,
                },
                onClick: refreshAll,
                disabled: currentLegalOfficerUnavailable,
            },
            {
                id: "loc-collection",
                text: "Collections",
                to: locRequestsPath('Collection'),
                exact: false,
                icon: {
                    icon: {
                        id: 'collection'
                    },
                    background: colorTheme.topMenuItems.iconGradient,
                },
                onClick: refreshAll,
                disabled: currentLegalOfficerUnavailable,
            },
            {
                id: "loc-transaction",
                text: "Transactions",
                to: locRequestsPath('Transaction'),
                exact: false,
                icon: {
                    icon: {
                        id: 'loc'
                    },
                    background: colorTheme.topMenuItems.iconGradient,
                },
                onClick: refreshAll,
                disabled: currentLegalOfficerUnavailable,
            },
            {
                id: "identity",
                text: "Identities",
                to: locRequestsPath('Identity'),
                exact: false,
                icon: {
                    icon: {
                        id: 'identity'
                    },
                    background: colorTheme.topMenuItems.iconGradient,
                },
                onClick: refreshAll,
                disabled: currentLegalOfficerUnavailable,
            }
        ];
        if(hasVoteFeature) {
            menuTop.push({
                id: "votes",
                text: "Votes",
                to: VOTES_PATH,
                exact: false,
                icon: {
                    icon: {
                        id: 'vote'
                    },
                    background: colorTheme.topMenuItems.iconGradient,
                },
                onClick: refreshAll,
                disabled: currentLegalOfficerUnavailable,
            });
        }
        return (
            <Dashboard
                menuTop={ menuTop }
                menuMiddle={[
                    {
                        id: "vault",
                        text: "Vault withdrawals",
                        to: VAULT_OUT_REQUESTS_PATH,
                        exact: true,
                        icon: {
                            icon: {
                                id: 'vault-big'
                            },
                            height: 'auto',
                            width: '60px',
                        },
                        onClick: refreshAll,
                        disabled: currentLegalOfficerUnavailable,
                    },
                    {
                        id: "recovery",
                        text: "Recovery Requests",
                        to: RECOVERY_REQUESTS_PATH,
                        exact: true,
                        icon: {
                            icon: {
                                id: 'recovery_request',
                                hasVariants: true,
                            },
                            height: 'auto',
                            width: '60px',
                        },
                        onClick: refreshAll,
                        disabled: currentLegalOfficerUnavailable,
                    }
                ]}
                menuBottom={[
                    {
                        id: "settings",
                        text: "Settings",
                        to: SETTINGS_PATH,
                        exact: true,
                        icon: {
                            icon: {
                                id: 'settings'
                            },
                            background: colorTheme.bottomMenuItems.iconGradient,
                        },
                        onClick: refreshAll,
                    }
                ]}
            >
                <LegalOfficerRouter />
                <WarningDialog
                    show={ missingSettings !== undefined && !discardSettings }
                    size='lg'
                    actions={[
                        {
                            buttonText: "I will do it later",
                            callback: () => setDiscardSettings(true),
                            id: "discard",
                            buttonVariant: 'secondary'
                        },
                        {
                            buttonText: "Go to my settings",
                            callback: () => { setDiscardSettings(true); navigate(SETTINGS_PATH)},
                            id: "settings",
                            buttonVariant: 'primary'
                        },
                    ]}
                >
                    <p>
                        Dear logion legal officer,<br/>
                        Some of your mandatory settings are not filled-in. Please do so as soon as possible.
                    </p>
                </WarningDialog>
            </Dashboard>
        );
    }
}
