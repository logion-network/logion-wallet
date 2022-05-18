import { useState, useEffect } from 'react';
import { getBalances } from "@logion/node-api/dist/Balances";
import { getVaultAddress } from "@logion/node-api/dist/Vault";

import { useLogionChain } from '../../logion-chain';

import { useCommonContext } from '../../common/CommonContext';
import { FullWidthPane } from '../../common/Dashboard';
import Tabs from '../../common/Tabs';
import Icon from '../../common/Icon';
import NetworkWarning from '../../common/NetworkWarning';

import { SETTINGS_PATH } from '../UserRouter';
import { useUserContext } from '../UserContext';

import WalletRecoveryProcessTab from "./WalletRecoveryProcessTab";
import VaultRecoveryProcessTab from "./VaultRecoveryProcessTab";

import './RecoveryProcess.css';
import { ClaimedRecovery } from '@logion/client';

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
    const { api } = useLogionChain();
    const { colorTheme, nodesDown } = useCommonContext();
    const { protectionState } = useUserContext();
    const [ recoveredVaultAddress, setRecoveredVaultAddress ] = useState<string | null>(null)
    const [ tabKey, setTabKey ] = useState<string>('Vault');
    const [ walletBalances, setWalletBalances ] = useState<number | null>(null)
    const [ vaultBalances, setVaultBalances ] = useState<number | null>(null)

    useEffect(() => {
        if (recoveredVaultAddress === null && (protectionState instanceof ClaimedRecovery)) {
            const recoveredAddress = protectionState.protectionParameters.recoveredAddress!;
            const legalOfficers = protectionState.protectionParameters.states.map(state => state.legalOfficer.address);
            setRecoveredVaultAddress(getVaultAddress(recoveredAddress, legalOfficers))
        }
    }, [ recoveredVaultAddress, setRecoveredVaultAddress, protectionState ])

    useEffect(() => {
        if (walletBalances === null && api !== null && (protectionState instanceof ClaimedRecovery)) {
            getBalances({ api, accountId: protectionState.protectionParameters.recoveredAddress! })
                .then(balances => {
                    setWalletBalances(balances.filter(balance => Number(balance.balance.toNumber()) > 0).length)
                })
        }
    }, [ walletBalances, setWalletBalances, protectionState, api ])

    useEffect(() => {
        if (vaultBalances === null && api !== null && recoveredVaultAddress !== null) {
            getBalances({ api, accountId: recoveredVaultAddress })
                .then(balances => {
                    setVaultBalances(balances.filter(balance => Number(balance.balance.toNumber()) > 0).length)
                })
        }
    }, [ vaultBalances, setVaultBalances, recoveredVaultAddress, api ])

    if (!(protectionState instanceof ClaimedRecovery) || walletBalances === null || vaultBalances === null) {
        return null;
    }

    return (
        <FullWidthPane
            className="RecoveryProcess"
            mainTitle="Recovery Process"
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
                                    size={ vaultBalances }
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
                                    size={ walletBalances }
                                />
                            ),
                            render: () => <WalletRecoveryProcessTab
                                vaultFirst={ vaultBalances > 0 }
                                onSuccess={ () => setWalletBalances(null) }
                            />
                        }
                    ] }
                    onSelect={ key => setTabKey(key) }
                />
            </>
        </FullWidthPane>
    );
}
