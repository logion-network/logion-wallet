import { useState, useCallback } from "react";
import { Spinner } from "react-bootstrap";
import { CoinBalance, Numbers } from "@logion/node-api";
import { BalanceState } from "@logion/client/dist/Balance.js";

import Table, { Cell, EmptyTableMessage } from "../../common/Table";
import Icon from "../../common/Icon";
import { AssetNameCell } from "../../common/Wallet";
import Button from "../../common/Button";
import TransactionConfirmation, { Status } from "../../common/TransactionConfirmation";
import Dialog from "../../common/Dialog";
import Alert from "../../common/Alert";
import IconTextRow from "../../common/IconTextRow";

import { useLogionChain } from "../../logion-chain";
import { useUserContext } from "../UserContext";
import ClientExtrinsicSubmitter, { Call, CallCallback } from "src/ClientExtrinsicSubmitter";
import CoinIcon from "src/components/coin/CoinIcon";

interface Props {
    vaultFirst: boolean
}

export default function WalletRecoveryProcessTab(props: Props) {
    const { accounts, signer } = useLogionChain();
    const { protectionState, recoveredBalanceState, mutateRecoveredBalanceState } = useUserContext();
    const [ recoveredCoinBalance, setRecoveredCoinBalance ] = useState<CoinBalance | null>(null);
    const [ signAndSubmit, setSignAndSubmit ] = useState<Call>();
    const [ signAndSubmitError, setSignAndSubmitError ] = useState<boolean>(false);

    const recoverCoin = useCallback(async () => {
        const signAndSubmit: Call = async (callback: CallCallback) => {
            await mutateRecoveredBalanceState(async (state: BalanceState) => {
                return state.transferAll({
                    signer: signer!,
                    destination: accounts!.current!.accountId.address,
                    callback,
                });
            });
        };
        setSignAndSubmit(() => signAndSubmit);
    }, [ accounts, signer, mutateRecoveredBalanceState ]);

    const clearFormCallback = useCallback(() => {
        setRecoveredCoinBalance(null);
        setSignAndSubmit(undefined);
        setSignAndSubmitError(false);
    }, [ setRecoveredCoinBalance, setSignAndSubmit, setSignAndSubmitError ])

    const amountToRecover = recoveredCoinBalance?.available ? recoveredCoinBalance?.available : new Numbers.PrefixedNumber("0", Numbers.NONE)

    const coinBalances: CoinBalance[] = recoveredBalanceState ? recoveredBalanceState.balances.filter(balance => balance.available.toNumber() > 0) : [];
    return (
        <>
            <TransactionConfirmation
                vaultFirst={ props.vaultFirst }
                clearFormCallback={ clearFormCallback }
                children={ (status, startTransferringCallback, cancelCallback, successCallback) => {
                    return (<>
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
                                        render: coinBalance => <Cell
                                            content={ coinBalance.available.coefficient.toFixedPrecision(2) } />,
                                        width: "300px",
                                        align: 'right',
                                    },
                                    {
                                        header: "Action",
                                        render: coinBalance => <Button
                                            disabled={ props.vaultFirst }
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
                            show={ status !== Status.IDLE }
                            size="lg"
                            actions={ [
                                {
                                    id: "cancel",
                                    buttonText: "Cancel",
                                    buttonVariant: "secondary",
                                    callback: cancelCallback,
                                    disabled: signAndSubmit !== undefined && !signAndSubmitError,
                                },
                                {
                                    id: "transfer",
                                    buttonText: "Transfer",
                                    buttonVariant: "recovery",
                                    callback: () => recoverCoin(),
                                    disabled: status !== Status.TRANSFERRING || signAndSubmit !== undefined,
                                }
                            ] }
                        >
                            { status === Status.TRANSFERRING &&
                                <p>
                                    You are about to
                                    transfer { amountToRecover.coefficient.toFixedPrecision(2) }&nbsp;
                                    { amountToRecover.prefix.symbol }
                                    { recoveredCoinBalance?.coin.symbol }
                                    <br />from account { protectionState?.protectionParameters.recoveredAddress || "" }
                                    <br />to account { accounts?.current?.accountId.address }.
                                </p>
                            }
                            <ClientExtrinsicSubmitter
                                call={ signAndSubmit }
                                onSuccess={ () => {
                                    clearFormCallback();
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
