import { useState, useCallback, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { CoinBalance, Numbers, Lgnt } from "@logion/node-api";
import { BalanceState } from "@logion/client";

import Table, { EmptyTableMessage } from "../../common/Table";
import Icon from "../../common/Icon";
import Button from "../../common/Button";
import Dialog from "../../common/Dialog";
import Alert from "../../common/Alert";
import IconTextRow from "../../common/IconTextRow";

import { CallCallback, useLogionChain } from "../../logion-chain";
import { useUserContext } from "../UserContext";
import CoinIcon from "../../components/coin/CoinIcon";
import ExtrinsicSubmissionStateView from "../../ExtrinsicSubmissionStateView";
import AmountCell from "../../common/AmountCell";
import { ExpectNewTransactionStatus, useCommonContext } from "../../common/CommonContext";
import AssetNameCell from "../../common/AssetNameCell";

interface Props {
    vaultFirst: boolean
}

export default function WalletRecoveryProcessTab(props: Props) {
    const { accounts, signer, submitCall, extrinsicSubmissionState, clearSubmissionState } = useLogionChain();
    const { protectionState, recoveredBalanceState, mutateRecoveredBalanceState } = useUserContext();
    const [ recoveredCoinBalance, setRecoveredCoinBalance ] = useState<CoinBalance | null>(null);
    const { expectNewTransaction, expectNewTransactionState, stopExpectNewTransaction } = useCommonContext();

    const clearFormCallback = useCallback(() => {
        setRecoveredCoinBalance(null);
        clearSubmissionState();
        stopExpectNewTransaction();
    }, [ setRecoveredCoinBalance, clearSubmissionState, stopExpectNewTransaction ])

    const recoverCoin = useCallback(async () => {
        const call = async (callback: CallCallback) => {
            await mutateRecoveredBalanceState(async (state: BalanceState) => {
                return state.transferAll({
                    signer: signer!,
                    destination: accounts!.current!.accountId.address,
                    keepAlive: false,
                    callback,
                });
            });
            expectNewTransaction();
        };
        try {
            await submitCall(call);
            clearFormCallback();
        } catch(_) {
            // State cleared on close
        }
    }, [ accounts, signer, mutateRecoveredBalanceState, submitCall, clearFormCallback, expectNewTransaction ]);

    useEffect(() => {
        if(expectNewTransactionState.status === ExpectNewTransactionStatus.DONE) {
            clearFormCallback();
        }
    }, [ expectNewTransactionState, clearFormCallback ]);

    const amountToRecover = recoveredCoinBalance?.available ? recoveredCoinBalance?.available : new Numbers.PrefixedNumber("0", Numbers.NONE)

    const coinBalances: CoinBalance[] = recoveredBalanceState ? recoveredBalanceState.balances.filter(balance => balance.available.toNumber() > 0) : [];
    return (
        <>
            <div className="content">
                { props.vaultFirst &&
                    <IconTextRow
                        icon={ <Icon icon={ { id: "tip" } } width="45px" /> }
                        text={ <p>
                            You must first request the recovery of assets protected in your logion
                            Vault.<br />
                            Once this logion Vault recovery is validated by your Legal Officer, you will be
                            able to request the recovery of your wallet assets.</p> }
                    />
                }
                <Table
                    columns={ [
                        {
                            header: "",
                            render: coinBalance => <CoinIcon coinId={ coinBalance.coin.id } height="36px" />,
                            width: "70px",
                        },
                        {
                            header: "Name",
                            render: coinBalance => <AssetNameCell balance={ coinBalance } />,
                            align: "left"
                        },
                        {
                            header: "Balance",
                            render: coinBalance => <AmountCell amount={ Lgnt.fromPrefixedNumber(coinBalance.available) } />,
                            width: "300px",
                            align: 'right',
                        },
                        {
                            header: "Action",
                            render: coinBalance => <Button
                                disabled={ props.vaultFirst }
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
                                (recoveredBalanceState !== null) &&
                                "No coin to recover"
                            }
                            {
                                (recoveredBalanceState === null) &&
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
                show={ recoveredCoinBalance !== null }
                size="lg"
                actions={ [
                    {
                        id: "cancel",
                        buttonText: "Cancel",
                        buttonVariant: "secondary",
                        callback: clearFormCallback,
                        disabled: extrinsicSubmissionState.inProgress,
                    },
                    {
                        id: "transfer",
                        buttonText: "Transfer",
                        buttonVariant: "recovery",
                        callback: () => recoverCoin(),
                        disabled: !extrinsicSubmissionState.canSubmit() || extrinsicSubmissionState.isError(),
                    }
                ] }
            >
                {
                    expectNewTransactionState.status === ExpectNewTransactionStatus.IDLE &&
                    <p>
                        You are about to
                        transfer { amountToRecover.coefficient.toFixedPrecision(2) }&nbsp;
                        { amountToRecover.prefix.symbol }
                        { recoveredCoinBalance?.coin.symbol }
                        <br />from account { protectionState?.protectionParameters.recoveredAccount?.address || "" }
                        <br />to account { accounts?.current?.accountId.address }.
                    </p>
                }
                <ExtrinsicSubmissionStateView />
                {
                    (expectNewTransactionState.status === ExpectNewTransactionStatus.WAITING_NEW_TRANSACTION) &&
                    <Alert variant="info">
                        <Spinner animation="border" />
                        <p>Transfer successful, waiting for the transaction to be finalized.</p>
                        <p>Note that this may take up to 30 seconds. If you want to proceed, you can safely
                            click on close but your transaction may not show up yet.</p>
                    </Alert>
                }
            </Dialog>
        </>
    );
}
