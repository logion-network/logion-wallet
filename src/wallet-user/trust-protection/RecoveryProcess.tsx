import React, { useState, useEffect, useCallback } from 'react';

import { useLogionChain } from '../../logion-chain';
import ExtrinsicSubmitter, { SignAndSubmit } from '../../ExtrinsicSubmitter';
import { useCommonContext } from '../../common/CommonContext';
import { FullWidthPane } from '../../common/Dashboard';
import Tabs from '../../common/Tabs';
import Table, { Cell, EmptyTableMessage } from '../../common/Table';
import { GREEN } from '../../common/ColorTheme';
import Button from '../../common/Button';
import Icon from '../../common/Icon';
import Dialog from '../../common/Dialog';
import { useUserContext } from '../UserContext';
import './RecoveryProcess.css';
import { CoinBalance, getBalances, buildTransferCall, estimateFee } from "../../logion-chain/Balances";
import { AssetNameCell } from "../../common/Wallet";
import { signAndSendAsRecovered } from "../../logion-chain/Recovery";
import { PrefixedNumber, MILLI } from "../../logion-chain/numbers";

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
    const { accounts, colorTheme } = useCommonContext();
    const { recoveredAddress } = useUserContext();
    const [ tabKey, setTabKey ] = useState<string>('coinBalances');
    const [ recoveredCoinBalance, setRecoveredCoinBalance ] = useState<CoinBalance | null>(null);
    const [ balances, setBalances ] = useState<CoinBalance[] | null>(null)
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ signAndSubmitError, setSignAndSubmitError ] = useState<boolean>(false);

    useEffect(() => {
        if (balances === null && api !== null) {
            if (recoveredAddress) {
                getBalances({ api, accountId: recoveredAddress })
                    .then(setBalances)
            } else {
                setBalances([])
            }
        }
    }, [ balances, setBalances, recoveredAddress, api ])

    const recoverCoin = useCallback(async (balance: PrefixedNumber) => {

        const fee = await estimateFee({ api: api!, amount: balance, destination: accounts!.current!.address });
        const amount = balance.subtract(fee)

        const signAndSubmit: SignAndSubmit = (setResult, setError) => signAndSendAsRecovered({
            api: api!,
            signerId: accounts!.current!.address,
            callback: setResult,
            errorCallback: setError,
            recoveredAccountId: recoveredAddress!,
            call: buildTransferCall({
                api: api!,
                amount: amount,
                destination: accounts!.current!.address,
            }),
        });
        setSignAndSubmit(() => signAndSubmit);
    }, [ api, accounts, recoveredAddress ]);

    const onTransferSuccess = useCallback(() => {
        setSignAndSubmit(null);
        setSignAndSubmitError(false);
        setRecoveredCoinBalance(null);
        setBalances(null);
    }, [ setSignAndSubmit, setRecoveredCoinBalance, setBalances ]);

    if (recoveredAddress === null) {
        return null;
    }

    const amountToRecover = recoveredCoinBalance?.balance ? recoveredCoinBalance?.balance : new PrefixedNumber("0", MILLI)

    const coinBalances: CoinBalance[] = (balances !== null) ? balances.filter(coinBalance => Number(coinBalance.balance.toNumber()) > 0) : [];
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
                            key: "coinBalances",
                            title: (
                                <TabTitle
                                    iconId="wallet"
                                    title="Coins"
                                    size={ coinBalances.length }
                                />
                            ),
                            render: () => (
                                <Table
                                    columns={ [
                                        {
                                            header: "Name",
                                            render: coinBalance => <AssetNameCell balance={ coinBalance } />,
                                        },
                                        {
                                            header: "Balance",
                                            render: coinBalance => <Cell
                                                content={ coinBalance.balance.coefficient.toFixedPrecision(2) } />,
                                            width: "300px",
                                            align: 'right',
                                        },
                                        {
                                            header: "Action",
                                            render: coinBalance => <Button
                                                variant="recovery"
                                                onClick={ () => setRecoveredCoinBalance(coinBalance) }
                                            >
                                                Transfer
                                            </Button>,
                                            width: "300px",
                                        }
                                    ] }
                                    data={ coinBalances }
                                    renderEmpty={ () => (
                                        <EmptyTableMessage>
                                            {
                                                (balances !== null) &&
                                                "No coin to recover"
                                            }
                                            {
                                                (balances === null) &&
                                                "Fetching data..."
                                            }
                                        </EmptyTableMessage>
                                    ) }
                                />
                            )
                        }
                    ] }
                    onSelect={ key => setTabKey(key || 'coinBalances') }
                />
                <Dialog
                    show={ recoveredCoinBalance !== null }
                    size="lg"
                    actions={ [
                        {
                            id: "cancel",
                            buttonText: "Cancel",
                            buttonVariant: "secondary",
                            callback: () => {
                                setRecoveredCoinBalance(null);
                                setSignAndSubmit(null);
                                setSignAndSubmitError(false);
                            },
                            disabled: signAndSubmit !== null && !signAndSubmitError,
                        },
                        {
                            id: "transfer",
                            buttonText: "Transfer",
                            buttonVariant: "recovery",
                            callback: () => recoverCoin(amountToRecover),
                            disabled: signAndSubmit !== null,
                        }
                    ]}
                >
                    <p>
                        You are about to
                        transfer { amountToRecover.coefficient.toFixedPrecision(2) }&nbsp;
                        { amountToRecover.prefix.symbol }
                        { recoveredCoinBalance?.coin.symbol }
                        <br />from account { recoveredAddress }
                        <br />to account { accounts?.current?.address }.
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
