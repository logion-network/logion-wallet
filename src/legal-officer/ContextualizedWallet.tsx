import { useCallback, useMemo, useState } from 'react';

import Dashboard from '../common/Dashboard';

import LegalOfficerRouter from './LegalOfficerRouter';
import { useCommonContext } from '../common/CommonContext';

import {
    HOME_PATH,
    PROTECTION_REQUESTS_PATH,
    RECOVERY_REQUESTS_PATH,
    SETTINGS_PATH,
    WALLET_PATH,
    IDENTITIES_PATH,
    locRequestsPath,
    VAULT_OUT_REQUESTS_PATH,
    STATEMENT_OF_FACTS_PATH,
} from './LegalOfficerPaths';
import { useLegalOfficerContext } from './LegalOfficerContext';
import { useLocation, useNavigate } from 'react-router-dom';
import StatementOfFacts from '../loc/statement/StatementOfFacts';
import { useLogionChain } from '../logion-chain';
import WarningDialog from 'src/common/WarningDialog';

export default function ContextualizedWallet() {
    const { selectAddress, accounts } = useLogionChain();
    const { colorTheme, refresh, availableLegalOfficers } = useCommonContext();
    const { refreshRequests, missingSettings, refreshLocs } = useLegalOfficerContext();
    const location = useLocation();
    const [ discardSettings, setDiscardSettings ] = useState(false);
    const navigate = useNavigate();

    const refreshAll = useCallback(() => {
        refresh(false);
        refreshRequests!(false);
        refreshLocs();
    }, [ refresh, refreshRequests, refreshLocs ]);

    const currentLegalOfficerUnavailable = useMemo(
        () => availableLegalOfficers?.find(node => node.address === accounts?.current?.address) === undefined,
    [ availableLegalOfficers, accounts ]);

    if(accounts === null || selectAddress === null || availableLegalOfficers === undefined) {
        return null;
    }

    if(location.pathname.startsWith(STATEMENT_OF_FACTS_PATH)) {
        return <StatementOfFacts />;
    } else {
        return (
            <Dashboard
                menuTop={[
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
                        to: WALLET_PATH,
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
                        to: IDENTITIES_PATH,
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
                ]}
                menuMiddle={[
                    {
                        id: "protection",
                        text: "Protection Management",
                        to: PROTECTION_REQUESTS_PATH,
                        exact: true,
                        icon: {
                            icon: {
                                id: 'shield',
                                hasVariants: true,
                            },
                            height: 'auto',
                            width: '60px',
                        },
                        onClick: refreshAll,
                        disabled: currentLegalOfficerUnavailable,
                    },
                    {
                        id: "vault",
                        text: "Vault-out Requests",
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
                    <>
                        Dear logion legal officer,<br/>
                        Some of your mandatory settings are not filled-in. Please do so as soon as possible.
                    </>
                </WarningDialog>
            </Dashboard>
        );
    }
}
