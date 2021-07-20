import React, { useState, useEffect, useCallback } from 'react';

import { useLogionChain } from '../../logion-chain';
import { balanceFromAmount, accountBalance, buildTransferCall } from '../../logion-chain/Assets';
import { AssetWithBalance } from '../../logion-chain/Types';
import { signAndSendAsRecovered } from '../../logion-chain/Recovery';
import ExtrinsicSubmitter, { SignAndSubmit } from '../../ExtrinsicSubmitter';

import { useRootContext } from '../../RootContext';
import { FullWidthPane } from '../../component/Dashboard';
import Tabs from '../../component/Tabs';
import Table, { Cell, EmptyTableMessage } from '../../component/Table';
import { ColorThemeType, GREEN } from '../../component/ColorTheme';
import Button from '../../component/Button';
import Icon from '../../component/Icon';
import Dialog from '../../component/Dialog';

import { useUserContext } from '../UserContext';
import { getOfficer } from "./Model";

import './RecoveryProcess.css';

interface Balances {
    accountId: string,
    balances?: AssetWithBalance[],
}

interface TabTitleProps {
    iconId: string,
    colorThemeType: ColorThemeType,
    title: string,
    size: number,
}

function TabTitle(props: TabTitleProps) {

    return (
        <div className="recovery-tab-title">
            <Icon icon={{id: props.iconId}} colorThemeType={ props.colorThemeType }/>
            <span className="title">{ props.title }</span>
            <span className="size">{ props.size }</span>
        </div>
    );
}

export default function RecoveryProcess() {
    const { api } = useLogionChain();
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme, recoveredAddress } = useUserContext();
    const [ tabKey, setTabKey ] = useState<string>('tokens');
    const [ balances, setBalances ] = useState<Balances | null>(null);
    const [ recoveredToken, setRecoveredToken ] = useState<AssetWithBalance | null>(null);
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);

    useEffect(() => {
        if(recoveredAddress !== null &&
                (balances === null || balances.accountId !== recoveredAddress)) {

            const accountId = recoveredAddress!;
            setBalances({
                accountId,
            });
            (async function() {
                const balances = await accountBalance({
                    api: api!,
                    accountId,
                });
                setBalances({
                    accountId,
                    balances,
                });
            })();
        }
    }, [ api, balances, recoveredAddress, setBalances ]);

    const recoverToken = useCallback(() => {
        const amount = balanceFromAmount(Number(recoveredToken!.balance), recoveredToken!.asset.metadata.decimals);
        const signAndSubmit: SignAndSubmit = (setResult, setError) => signAndSendAsRecovered({
            api: api!,
            signerId: addresses!.currentAddress.address,
            callback: setResult,
            errorCallback: setError,
            recoveredAccountId: recoveredAddress!,
            call: buildTransferCall({
                api: api!,
                assetId: recoveredToken!.asset.assetId,
                amount,
                target: addresses!.currentAddress.address,
            }),
        });
        setSignAndSubmit(() => signAndSubmit);
    }, [ api, addresses, recoveredToken, recoveredAddress ]);

    const onTransferSuccess = useCallback(() => {
        setSignAndSubmit(null);
        setRecoveredToken(null);
        setBalances(null);
    }, [ setSignAndSubmit, setRecoveredToken, setBalances ]);

    if(addresses === null || selectAddress === null || recoveredAddress === null) {
        return null;
    }

    const tokens: AssetWithBalance[] = (balances !== null && balances.balances !== undefined) ? balances.balances.filter(token => Number(token.balance) > 0) : [];
    return (
        <FullWidthPane
            className="RecoveryProcess"
            mainTitle="Recovery Process"
            titleIcon={{
                icon: {
                    id: 'recovery',
                },
                background: colorTheme.recoveryItems.iconGradient,
            }}
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
        >
            <>
                <div
                    className="alert-activated"
                    style={{
                        color: GREEN,
                        borderColor: GREEN,
                    }}
                >
                    <Icon
                        colorThemeType={ colorTheme.type }
                        icon={{id: 'activated'}}
                    /> You are now ready to transfer assets
                    from recovered address { recoveredAddress }.
                </div>
                <Tabs
                    activeKey={ tabKey }
                    tabs={[
                        {
                            key: "tokens",
                            title: (
                                <TabTitle
                                    iconId="tokens"
                                    colorThemeType={ colorTheme.type }
                                    title="Tokens"
                                    size={ tokens.length }
                                />
                            ),
                            render: () => (
                                    <Table
                                        columns={[
                                            {
                                                header: "Name",
                                                render: token => <Cell content={ token.asset.metadata.symbol } />,
                                                width: "150px",
                                            },
                                            {
                                                header: "Description",
                                                render: token => <Cell content={ token.asset.metadata.name } />,
                                            },
                                            {
                                                header: "Balance",
                                                render: token => <Cell content={ token.balance } />,
                                                width: "200px",
                                            },
                                            {
                                                header: "Legal officer",
                                                render: token => <Cell content={ getOfficer(token.asset.issuer)!.name } />,
                                                width: "150px",
                                            },
                                            {
                                                header: "Action",
                                                render: token => <Button
                                                    variant="recovery"
                                                    onClick={ () => setRecoveredToken(token) }
                                                    colors={ colorTheme.buttons }
                                                >
                                                    Transfer
                                                </Button>,
                                                width: "150px",
                                            }
                                        ]}
                                        data={ tokens }
                                        colorTheme={ colorTheme }
                                        renderEmpty={ () => (
                                            <EmptyTableMessage>
                                                {
                                                    (balances !== null && balances.balances !== undefined) &&
                                                    "No token to recover"
                                                }
                                                {
                                                    (balances === null || balances.balances === undefined) &&
                                                    "Fetching data..."
                                                }
                                            </EmptyTableMessage>
                                        )}
                                    />
                            )
                        }
                    ]}
                    colors={ colorTheme.tabs }
                    onSelect={ key => setTabKey(key || 'tokens') }
                />
                <Dialog
                    show={ recoveredToken !== null }
                    colors={ colorTheme }
                    size="lg"
                    actions={[
                        {
                            id: "cancel",
                            buttonText: "Cancel",
                            buttonVariant: "secondary",
                            callback: () => setRecoveredToken(null)
                        },
                        {
                            id: "transfer",
                            buttonText: "Transfer",
                            buttonVariant: "recovery",
                            callback: recoverToken
                        }
                    ]}
                >
                    <p>
                        You are about to transfer { recoveredToken?.balance } units of
                        token { recoveredToken?.asset.metadata.symbol } to
                        account { addresses?.currentAddress.address }.
                    </p>
                    <ExtrinsicSubmitter
                        id="transfer"
                        signAndSubmit={ signAndSubmit }
                        onSuccess={ onTransferSuccess }
                        onError={ () => {} }
                    />
                </Dialog>
            </>
        </FullWidthPane>
    );
}
