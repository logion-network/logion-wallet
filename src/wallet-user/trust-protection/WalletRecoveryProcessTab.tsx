import Table, { Cell, EmptyTableMessage } from "../../common/Table";
import Icon from "../../common/Icon";
import { AssetNameCell } from "../../common/Wallet";
import Button from "../../common/Button";
import React, { useState, useCallback, useEffect } from "react";
import { CoinBalance, buildTransferCall, getBalances } from "../../logion-chain/Balances";
import { PrefixedNumber, MILLI } from "../../logion-chain/numbers";
import ExtrinsicSubmitter, { SignAndSubmit } from "../../ExtrinsicSubmitter";
import TransactionConfirmation, { Status } from "../../common/TransactionConfirmation";
import Dialog from "../../common/Dialog";
import Alert from "../../common/Alert";
import { Spinner } from "react-bootstrap";
import { useLogionChain } from "../../logion-chain";
import { signAndSendAsRecovered } from "../../logion-chain/Recovery";
import { useCommonContext } from "../../common/CommonContext";
import { useUserContext } from "../UserContext";

export default function WalletRecoveryProcessTab() {
    const { api } = useLogionChain();
    const { accounts } = useCommonContext();
    const { recoveredAddress } = useUserContext();
    const [ recoveredCoinBalance, setRecoveredCoinBalance ] = useState<CoinBalance | null>(null);
    const [ balances, setBalances ] = useState<CoinBalance[] | null>(null)
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ signAndSubmitError, setSignAndSubmitError ] = useState<boolean>(false);

    useEffect(() => {
        if (balances === null && api !== null && recoveredAddress) {
            getBalances({ api, accountId: recoveredAddress })
                .then(balances => {
                    setBalances(balances.filter(balance => Number(balance.balance.toNumber()) > 0))
                })
        }
    }, [ balances, setBalances, recoveredAddress, api ])

    const recoverCoin = useCallback(async (amount: PrefixedNumber) => {

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

    const clearFormCallback = useCallback(() => {
        setRecoveredCoinBalance(null);
        setSignAndSubmit(null);
        setSignAndSubmitError(false);
    }, [ setRecoveredCoinBalance, setSignAndSubmit, setSignAndSubmitError ])

    const onTransferSuccess = useCallback(() => {
        clearFormCallback();
        setBalances(null);
    }, [ setBalances, clearFormCallback ]);

    const amountToRecover = recoveredCoinBalance?.balance ? recoveredCoinBalance?.balance : new PrefixedNumber("0", MILLI)

    const coinBalances: CoinBalance[] = (balances !== null) ? balances.filter(coinBalance => Number(coinBalance.balance.toNumber()) > 0) : [];
    return (
        <>
            <TransactionConfirmation
                clearFormCallback={ clearFormCallback }
                children={ (status, startTransferringCallback, cancelCallback, successCallback) => {
                    return (<>
                        <div className="content">
                            <Table
                                columns={ [
                                    {
                                        header: "",
                                        render: coinBalance => <Icon icon={ { id: coinBalance.coin.iconId } }
                                                                     type={ coinBalance.coin.iconType } height="36px"
                                                                     width="auto" />,
                                        width: "70px",
                                    },
                                    {
                                        header: "Name",
                                        render: coinBalance => <AssetNameCell balance={ coinBalance } />,
                                        align: "left"
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
                                            onClick={ () => {
                                                setRecoveredCoinBalance(coinBalance);
                                                startTransferringCallback()
                                            } }
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
                        </div>
                        <div className="recovery-process-footer">
                            <img className="recovery-process-footer-image"
                                 src={ process.env.PUBLIC_URL + "/assets/recovery-process.png" }
                                 alt="legal officer giving key" />
                        </div>
                        <Dialog
                            show={ status !== Status.IDLE }
                            size="lg"
                            actions={ [
                                {
                                    id: "cancel",
                                    buttonText: "Cancel",
                                    buttonVariant: "secondary",
                                    callback: cancelCallback,
                                    disabled: signAndSubmit !== null && !signAndSubmitError,
                                },
                                {
                                    id: "transfer",
                                    buttonText: "Transfer",
                                    buttonVariant: "recovery",
                                    callback: () => recoverCoin(amountToRecover),
                                    disabled: status !== Status.TRANSFERRING || signAndSubmit !== null,
                                }
                            ] }
                        >
                            { status === Status.TRANSFERRING &&
                                <p>
                                    You are about to
                                    transfer { amountToRecover.coefficient.toFixedPrecision(2) }&nbsp;
                                    { amountToRecover.prefix.symbol }
                                    { recoveredCoinBalance?.coin.symbol }
                                    <br />from account { recoveredAddress }
                                    <br />to account { accounts?.current?.address }.
                                </p>
                            }
                            <ExtrinsicSubmitter
                                id="transfer"
                                signAndSubmit={ signAndSubmit }
                                onSuccess={ () => {
                                    onTransferSuccess();
                                    successCallback()
                                } }
                                onError={ () => setSignAndSubmitError(true) }
                            />
                            { (status === Status.EXPECTING_NEW_TRANSACTION || status === Status.WAITING_FOR_NEW_TRANSACTION) &&
                                <Alert variant="info">
                                    <Spinner animation="border" />
                                    <p>Transfer successful, waiting for the transaction to be finalized.</p>
                                    <p>Note that this may take up to 30 seconds. If you want to proceed, you can safely
                                        click on cancel but your transaction may not show up yet.</p>
                                </Alert>
                            }
                        </Dialog>
                    </>)
                } } />
        </>)
}
