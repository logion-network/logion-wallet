import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getVaultAddress, buildVaultTransferCall } from "../../logion-chain/Vault";
import { useLogionChain } from "../../logion-chain";
import { useCommonContext } from "../../common/CommonContext";
import { useUserContext } from "../UserContext";
import { CoinBalance, getBalances, LGNT_SMALLEST_UNIT } from "../../logion-chain/Balances";
import { PrefixedNumber, MILLI } from "../../logion-chain/numbers";
import ExtrinsicSubmitter, { AsyncSignAndSubmit, SuccessfulTransaction } from "../../ExtrinsicSubmitter";
import { signAndSendAsRecovered } from "../../logion-chain/Recovery";
import { useForm, Controller } from "react-hook-form";
import { VaultApi } from "../../vault/VaultApi";
import Button from "../../common/Button";
import { AssetNameCell } from "../../common/Wallet";
import Dialog from "../../common/Dialog";
import Icon from "../../common/Icon";
import Table, { Cell, EmptyTableMessage } from "../../common/Table";
import { buildOptions } from "./SelectLegalOfficer";
import Select from "../../common/Select";
import FormGroup from "../../common/FormGroup";
import { LegalOfficer } from "../../directory/DirectoryApi";

interface FormValues {
    legalOfficer: string | null;
}

enum Status {
    IDLE,
    TRANSFERRING,
}

export default function VaultRecoveryProcessTab() {

    const { api } = useLogionChain();
    const { accounts, availableLegalOfficers, axiosFactory, refresh, colorTheme } = useCommonContext();
    const { recoveredAddress, recoveryConfig } = useUserContext();
    const [ recoveredCoinBalance, setRecoveredCoinBalance ] = useState<CoinBalance | null>(null);
    const [ recoveredVaultAddress, setRecoveredVaultAddress ] = useState<string | null>(null)
    const [ targetVaultAddress, setTargetVaultAddress ] = useState<string | null>(null)
    const [ vaultBalances, setVaultBalances ] = useState<CoinBalance[] | null>(null)
    const [ legalOfficer, setLegalOfficer ] = useState<string | null>(null)
    const [ status, setStatus ] = useState<Status>(Status.IDLE)
    const [ asyncSignAndSubmit, setAsyncSignAndSubmit ] = useState<AsyncSignAndSubmit>(null);
    const [ signAndSubmitError, setSignAndSubmitError ] = useState<boolean>(false);
    const [ candidates, setCandidates ] = useState<LegalOfficer[]>([]);

    useEffect(() => {
        if (candidates.length === 0 && recoveryConfig && availableLegalOfficers) {
            setCandidates(availableLegalOfficers.filter(legalOfficer => recoveryConfig.legalOfficers.includes(legalOfficer.address)));
        }
    }, [ candidates, setCandidates, availableLegalOfficers, recoveryConfig ])

    useEffect(() => {
        if (recoveredVaultAddress === null && recoveredAddress && recoveryConfig) {
            setRecoveredVaultAddress(getVaultAddress(recoveredAddress, recoveryConfig))
        }
    }, [ recoveredVaultAddress, setRecoveredVaultAddress, recoveredAddress, recoveryConfig ])

    useEffect(() => {
        if (targetVaultAddress === null && accounts && recoveryConfig) {
            setTargetVaultAddress(getVaultAddress(accounts.current!.address, recoveryConfig))
        }
    }, [ targetVaultAddress, setTargetVaultAddress, accounts, recoveryConfig])

    useEffect(() => {
        if (vaultBalances === null && api !== null && recoveredVaultAddress) {
            getBalances({ api, accountId: recoveredVaultAddress })
                .then(balances => {
                    setVaultBalances(balances.filter(balance => Number(balance.balance.toNumber()) > 0))
                })
        }
    }, [ vaultBalances, setVaultBalances, recoveredVaultAddress, api ])

    const { control, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            legalOfficer: null
        }
    });

    const clearFormCallback = useCallback(() => {
        setRecoveredCoinBalance(null);
        setAsyncSignAndSubmit(null);
        setSignAndSubmitError(false);
        setLegalOfficer(null);
        setStatus(Status.IDLE);
    }, [ setRecoveredCoinBalance, setAsyncSignAndSubmit, setSignAndSubmitError ])

    const amountToRecover = useMemo<PrefixedNumber>(() => recoveredCoinBalance?.balance ?
            recoveredCoinBalance?.balance :
            new PrefixedNumber("0", MILLI),
        [ recoveredCoinBalance ])

    const onTransferSuccessCallback = useCallback(async (_id: string, submittable: SuccessfulTransaction) => {
        const axios = axiosFactory!(legalOfficer!);
        const vaultApi = new VaultApi(axios, legalOfficer!);
        const requesterAddress = accounts!.current!.address;
        const blockHeader = await api!.rpc.chain.getHeader(submittable.block);
        await vaultApi.createVaultTransferRequest({
            amount: amountToRecover.convertTo(LGNT_SMALLEST_UNIT).coefficient.unnormalize(),
            destination: targetVaultAddress!,
            block: blockHeader.number.toString(),
            index: submittable.index,
            requesterAddress,
        });
        clearFormCallback();
        refresh();
    }, [ accounts, api, axiosFactory, legalOfficer, refresh, targetVaultAddress, clearFormCallback, amountToRecover ])

    const recoverCoin = useCallback(async (amount: PrefixedNumber) => {
        const signAndSubmit: AsyncSignAndSubmit = (setResult, setError) => {
            return buildVaultTransferCall({
                api: api!,
                requesterAddress: recoveredAddress!,
                destination: targetVaultAddress!,
                recoveryConfig: recoveryConfig!,
                amount: amount,
            }).then(call => {
                const unsubscriber = signAndSendAsRecovered({
                    api: api!,
                    signerId: accounts!.current!.address,
                    callback: setResult,
                    errorCallback: setError,
                    recoveredAccountId: recoveredAddress!,
                    call
                });
                return { unsubscriber }
            }).catch(reason => {
                setError(reason)
                return {
                    unsubscriber: Promise.resolve(() => {
                    })
                }
            })
        }
        setAsyncSignAndSubmit(() => signAndSubmit)
    }, [ api, accounts, recoveredAddress, recoveryConfig, targetVaultAddress ])

    if (recoveredVaultAddress === null || availableLegalOfficers === undefined || !targetVaultAddress) {
        return null;
    }

    const coinBalances: CoinBalance[] = (vaultBalances !== null) ? vaultBalances.filter(coinBalance => Number(coinBalance.balance.toNumber()) > 0) : [];
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
                                    setStatus(Status.TRANSFERRING)
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
                                (vaultBalances !== null) &&
                                "No coin to recover"
                            }
                            {
                                (vaultBalances === null) &&
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
                        callback: clearFormCallback,
                        disabled: asyncSignAndSubmit !== null && !signAndSubmitError,
                    },
                    {
                        id: "transfer",
                        buttonText: "Transfer",
                        buttonVariant: "recovery",
                        callback: () => recoverCoin(amountToRecover),
                        disabled: status !== Status.TRANSFERRING || asyncSignAndSubmit !== null || legalOfficer === null,
                    }
                ] }
            >
                { status === Status.TRANSFERRING && <>
                    <FormGroup
                        id="legalOfficer"
                        label="Legal officer"
                        control={
                            <Controller
                                name="legalOfficer"
                                control={ control }
                                rules={ {
                                    required: 'You must select a Legal Officer',
                                    minLength: {
                                        value: 1,
                                        message: 'You must select a Legal Officer'
                                    },

                                } }
                                render={ () => (
                                    <Select
                                        isInvalid={ !!errors.legalOfficer?.message }
                                        options={ buildOptions(candidates) }
                                        value={ legalOfficer }
                                        onChange={ value => setLegalOfficer(value) }
                                    />
                                ) }
                            />
                        }
                        feedback={ errors.legalOfficer?.message }
                        colors={ colorTheme.dialog }
                    />
                    <p>
                        You are about to request your legal officer to confirm the
                        transfer of { amountToRecover.coefficient.toFixedPrecision(2) }&nbsp;
                        { amountToRecover.prefix.symbol }
                        { recoveredCoinBalance?.coin.symbol }
                        <br />from account { recoveredVaultAddress }
                        <br />to account { targetVaultAddress }.
                    </p>
                </>
                }
                <ExtrinsicSubmitter
                    id="transfer"
                    asyncSignAndSubmit={ asyncSignAndSubmit }
                    onSuccess={ onTransferSuccessCallback }
                    onError={ () => setSignAndSubmitError(true) }
                />
            </Dialog>
        </>
    )
}
