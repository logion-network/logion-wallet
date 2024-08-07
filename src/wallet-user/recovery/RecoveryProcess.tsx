import { Lgnt } from '@logion/node-api';
import { useState } from 'react';

import { useCommonContext } from '../../common/CommonContext';
import { FullWidthPane } from '../../common/Dashboard';
import Tabs from '../../common/Tabs';
import Icon from '../../common/Icon';
import NetworkWarning from '../../common/NetworkWarning';

import { SETTINGS_PATH } from '../UserPaths';
import { useUserContext } from '../UserContext';

import WalletRecoveryProcessTab from "./WalletRecoveryProcessTab";
import VaultRecoveryProcessTab from "./VaultRecoveryProcessTab";
import AccountProtectionFrame from '../protection/AccountProtectionFrame';

import './RecoveryProcess.css';

interface TabTitleProps {
    iconId: string,
    title: string,
    size: number,
}

function TabTitle(props: TabTitleProps) {

    return (
        <div className="recovery-tab-title">
            <Icon icon={{id: props.iconId}} />
            <span className="title">{ props.title }</span>
            <span className="size">{ props.size }</span>
        </div>
    );
}

export default function RecoveryProcess() {
    const { colorTheme, nodesDown } = useCommonContext();
    const { recoveredBalanceState, recoveredVaultState } = useUserContext();
    const [ tabKey, setTabKey ] = useState<string>('Vault');

    if (!recoveredBalanceState || !recoveredVaultState) {
        return null;
    }

    const walletBalances = recoveredBalanceState.balance.total.compareTo(Lgnt.zero()) > 0 ? [ recoveredBalanceState.balance ] : [];
    const vaultBalances = recoveredVaultState.balance.total.compareTo(Lgnt.zero()) > 0 ? [ recoveredVaultState.balance ] : [];

    return (
        <FullWidthPane
            className="RecoveryProcess"
            mainTitle="My Logion Protection"
            subTitle="Recovery Process"
            titleIcon={ {
                icon: {
                    id: 'recovery',
                },
                background: colorTheme.recoveryItems.iconGradient,
            } }
        >
            <>
                {
                        nodesDown.length > 0 &&
                        <NetworkWarning settingsPath={ SETTINGS_PATH } />
                }

                <Tabs
                    activeKey={ tabKey }
                    tabs={[
                        {
                            key: "Vault",
                            title: (
                                <TabTitle
                                    iconId="vault"
                                    title="Vault"
                                    size={ vaultBalances.length }
                                />
                            ),
                            render: () => <VaultRecoveryProcessTab/>
                        },
                        {
                            key: "Wallet",
                            title: (
                                <TabTitle
                                    iconId="wallet"
                                    title="Wallet"
                                    size={ walletBalances.length }
                                />
                            ),
                            render: () => <WalletRecoveryProcessTab
                                vaultFirst={ vaultBalances.length > 0 }
                            />
                        }
                    ] }
                    onSelect={ key => setTabKey(key) }
                />

                <div className="account-protection-container">
                    <AccountProtectionFrame type='activated' />
                </div>
            </>
        </FullWidthPane>
    );
}
