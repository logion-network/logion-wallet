import React, { useState, useEffect, useCallback } from 'react';

import { useLogionChain } from '../../logion-chain';
import { balanceFromAmount, accountBalance, buildTransferCall, AssetWithBalance } from '../../logion-chain/Assets';
import { signAndSendAsRecovered } from '../../logion-chain/Recovery';
import ExtrinsicSubmitter, { SignAndSubmit } from '../../ExtrinsicSubmitter';

import { useCommonContext } from '../../common/CommonContext';
import { FullWidthPane } from '../../common/Dashboard';
import Tabs from '../../common/Tabs';
import Table, { Cell, EmptyTableMessage } from '../../common/Table';
import { GREEN } from '../../common/ColorTheme';
import Button from '../../common/Button';
import Icon from '../../common/Icon';
import Dialog from '../../common/Dialog';
import { getOfficer } from "../../common/types/LegalOfficer";

import { useUserContext } from '../UserContext';

import './RecoveryProcess.css';

interface Balances {
    accountId: string,
    balances?: AssetWithBalance[],
}

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
    const { addresses, colorTheme } = useCommonContext();
    const { recoveredAddress } = useUserContext();
    const [ tabKey, setTabKey ] = useState<string>('tokens');
    const [ balances, setBalances ] = useState<Balances | null>(null);
    const [ recoveredToken, setRecoveredToken ] = useState<AssetWithBalance | null>(null);
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ signAndSubmitError, setSignAndSubmitError ] = useState<boolean>(false);

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
        setSignAndSubmitError(false);
        setRecoveredToken(null);
        setBalances(null);
    }, [ setSignAndSubmit, setRecoveredToken, setBalances ]);

    if(recoveredAddress === null) {
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
                                                >
                                                    Transfer
                                                </Button>,
                                                width: "150px",
                                            }
                                        ]}
                                        data={ tokens }
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
                    onSelect={ key => setTabKey(key || 'tokens') }
                />
                <Dialog
                    show={ recoveredToken !== null }
                    size="lg"
                    actions={[
                        {
                            id: "cancel",
                            buttonText: "Cancel",
                            buttonVariant: "secondary",
                            callback: () => { setRecoveredToken(null); setSignAndSubmit(null); setSignAndSubmitError(false); },
                            disabled: signAndSubmit !== null && !signAndSubmitError,
                        },
                        {
                            id: "transfer",
                            buttonText: "Transfer",
                            buttonVariant: "recovery",
                            callback: recoverToken,
                            disabled: signAndSubmit !== null,
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
                        onError={ () => setSignAndSubmitError(true) }
                    />
                </Dialog>
            </>
        </FullWidthPane>
    );
}
