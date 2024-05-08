import { useState, useCallback, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { TypesAccountData, Numbers, Lgnt, Fees } from "@logion/node-api";
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
import EstimatedFees from "../../loc/fees/EstimatedFees";
import { toOptimizedNumber } from "src/common/Amount";
import { toUnit } from "src/common/AmountFormat";

interface Props {
    vaultFirst: boolean
}

export default function WalletRecoveryProcessTab(props: Props) {
    const { accounts, signer, submitCall, extrinsicSubmissionState, clearSubmissionState } = useLogionChain();
    const { protectionState, recoveredBalanceState, mutateRecoveredBalanceState } = useUserContext();
    const [ recoveredCoinBalance, setRecoveredCoinBalance ] = useState<TypesAccountData | null>(null);
    const { expectNewTransaction, expectNewTransactionState, stopExpectNewTransaction } = useCommonContext();
    const [ transferFees, setTransferFees ] = useState<Fees>();

    const clearFormCallback = useCallback(() => {
        setRecoveredCoinBalance(null);
        clearSubmissionState();
        stopExpectNewTransaction();
        setTransferFees(undefined);
    }, [ setRecoveredCoinBalance, clearSubmissionState, stopExpectNewTransaction ])

    const createTransferParams = useCallback(() => {
        return{
            destination: accounts!.current!.accountId.address,
            keepAlive: false,
        }
    }, [ accounts ]);

    const recoverCoin = useCallback(async () => {
        const call = async (callback: CallCallback) => {
            await mutateRecoveredBalanceState(async (state: BalanceState) => {
                return state.transferAll({
                    signer: signer!,
                    payload: createTransferParams(),
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
    }, [ signer, mutateRecoveredBalanceState, submitCall, clearFormCallback, expectNewTransaction, createTransferParams ]);

    useEffect(() => {
        if (recoveredBalanceState !== undefined) {
            recoveredBalanceState.estimateFeesTransferAll(createTransferParams())
                .then(setTransferFees)
        }
    }, [ recoveredBalanceState, createTransferParams ]);

    useEffect(() => {
        if(expectNewTransactionState.status === ExpectNewTransactionStatus.DONE) {
            clearFormCallback();
        }
    }, [ expectNewTransactionState, clearFormCallback ]);

    const amountToRecover = recoveredCoinBalance?.available ? toOptimizedNumber(recoveredCoinBalance.available) : new Numbers.PrefixedNumber("0", Numbers.ATTO);

    const coinBalances = recoveredBalanceState?.balance ? [ recoveredBalanceState?.balance ] : [];
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
                            render: _ => <CoinIcon height="36px" />,
                            width: "70px",
                        },
                        {
                            header: "Name",
                            render: coinBalance => <AssetNameCell unit={ toUnit(coinBalance.total) } />,
                            align: "left"
                        },
                        {
                            header: "Balance",
                            render: coinBalance => <AmountCell amount={ coinBalance?.total || null } />,
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
                    <>
                        <p>
                            You are about to
                            transfer { amountToRecover.coefficient.toFixedPrecision(2) }&nbsp;
                            { amountToRecover.prefix.symbol }
                            { Lgnt.CODE }
                            <br />from account { protectionState?.protectionParameters.recoveredAccount?.address || "" }
                            <br />to account { accounts?.current?.accountId.address }.
                        </p>
                        <EstimatedFees fees={ transferFees }/>
                    </>
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
