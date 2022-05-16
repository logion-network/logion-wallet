import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { getVaultAddress, buildVaultTransferCall } from "@logion/node-api/dist/Vault";
import { PrefixedNumber, NONE } from "@logion/node-api/dist/numbers";
import { asRecovered } from "@logion/node-api/dist/Recovery";
import { CoinBalance, getBalances, LGNT_SMALLEST_UNIT } from "@logion/node-api/dist/Balances";
import { LegalOfficer } from "@logion/client";

import { useLogionChain } from "../../logion-chain";
import ExtrinsicSubmitter, { AsyncSignAndSubmit, SuccessfulTransaction, SignAndSubmit } from "../../ExtrinsicSubmitter";
import { VaultApi, VaultTransferRequest } from "../../vault/VaultApi";

import { useCommonContext } from "../../common/CommonContext";
import Button from "../../common/Button";
import { AssetNameCell } from "../../common/Wallet";
import Dialog from "../../common/Dialog";
import Icon from "../../common/Icon";
import Table, { Cell, EmptyTableMessage } from "../../common/Table";
import Select from "../../common/Select";
import FormGroup from "../../common/FormGroup";
import VaultTransferRequestStatusCell from "../../common/VaultTransferRequestStatusCell";
import Clickable from "../../common/Clickable";
import {
    cancelVaultTransferCallback,
    onCancelVaultTransferSuccessCallback
} from "../../common/VaultTransferRequestsCallbacks";
import ButtonGroup from "../../common/ButtonGroup";

import { useUserContext } from "../UserContext";

import { buildOptions } from "./SelectLegalOfficer";
import "./VaultRecoveryProcessTab.css"
import { signAndSend } from "src/logion-chain/Signature";

interface FormValues {
    legalOfficer: string | null;
}

enum Status {
    IDLE,
    TRANSFERRING,
}

export default function VaultRecoveryProcessTab() {

    const { api, accounts, axiosFactory } = useLogionChain();
    const { refresh, colorTheme, availableLegalOfficers, cancelableVaultRecoveryRequest } = useCommonContext();
    const { recoveredAddress, recoveryConfig } = useUserContext();
    const [ recoveredCoinBalance, setRecoveredCoinBalance ] = useState<CoinBalance | null>(null);
    const [ recoveredVaultAddress, setRecoveredVaultAddress ] = useState<string | null>(null)
    const [ targetVaultAddress, setTargetVaultAddress ] = useState<string | null>(null)
    const [ vaultBalances, setVaultBalances ] = useState<CoinBalance[] | null>(null)
    const [ legalOfficer, setLegalOfficer ] = useState<string | null>(null)
    const [ status, setStatus ] = useState<Status>(Status.IDLE)
    const [ requestSignAndSubmit, setRequestSignAndSubmit ] = useState<AsyncSignAndSubmit>(null);
    const [ requestFailed, setRequestFailed ] = useState<boolean>(false);
    const [ candidates, setCandidates ] = useState<LegalOfficer[]>([]);
    const [ vaultRecoveryRequest, setVaultRecoveryRequest ] = useState<VaultTransferRequest | null | undefined>(undefined);
    const [ requestToCancel, setRequestToCancel ] = useState<VaultTransferRequest | null>(null);
    const [ cancelSignAndSubmit, setCancelSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ cancelFailed, setCancelFailed ] = useState(false);

    useEffect(() => {
        if (cancelableVaultRecoveryRequest && vaultRecoveryRequest === undefined && recoveredAddress) {
            setVaultRecoveryRequest(cancelableVaultRecoveryRequest(recoveredAddress))
        }
    }, [ cancelableVaultRecoveryRequest, setVaultRecoveryRequest, recoveredAddress, vaultRecoveryRequest ])

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
                    setVaultBalances(balances.filter(balance => Number(balance.available.toNumber()) > 0))
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
        setRequestSignAndSubmit(null);
        setCancelSignAndSubmit(null);
        setRequestFailed(false);
        setCancelFailed(false);
        setLegalOfficer(null);
        setStatus(Status.IDLE);
    }, [ setRecoveredCoinBalance, setRequestSignAndSubmit, setCancelSignAndSubmit, setRequestFailed ])

    const amountToRecover = useMemo<PrefixedNumber>(() => recoveredCoinBalance?.available ?
            recoveredCoinBalance?.available :
            new PrefixedNumber("0", NONE),
        [ recoveredCoinBalance ])

    const onTransferSuccessCallback = useCallback(async (_id: string, submittable: SuccessfulTransaction) => {
        const axios = axiosFactory!(legalOfficer!);
        const vaultApi = new VaultApi(axios, legalOfficer!);
        const blockHeader = await api!.rpc.chain.getHeader(submittable.block);
        const vaultTransferRequest = await vaultApi.createVaultTransferRequest({
            amount: amountToRecover.convertTo(LGNT_SMALLEST_UNIT).coefficient.unnormalize(),
            destination: targetVaultAddress!,
            block: blockHeader.number.toString(),
            index: submittable.index,
            origin: recoveredAddress!,
        });
        setVaultRecoveryRequest(vaultTransferRequest)
        clearFormCallback();
        refresh();
    }, [ api, axiosFactory, legalOfficer, refresh, targetVaultAddress, clearFormCallback, amountToRecover, recoveredAddress, setVaultRecoveryRequest ])

    const recoverCoin = useCallback(async (amount: PrefixedNumber) => {
        const signAndSubmit: AsyncSignAndSubmit = async (setResult, setError) => {
            try {
                const call = await buildVaultTransferCall({
                    api: api!,
                    requesterAddress: recoveredAddress!,
                    destination: targetVaultAddress!,
                    recoveryConfig: recoveryConfig!,
                    amount: amount,
                })
                const unsubscriber = signAndSend({
                    signerId: accounts!.current!.address,
                    callback: setResult,
                    errorCallback: setError,
                    submittable: asRecovered({
                        api: api!,
                        recoveredAccountId: recoveredAddress!,
                        call
                    })
                });
                return { unsubscriber }
            } catch (error) {
                setError(error)
                return {
                    unsubscriber: Promise.resolve(() => {
                    })
                }
            }
        }
        setRequestSignAndSubmit(() => signAndSubmit)
    }, [ api, accounts, recoveredAddress, recoveryConfig, targetVaultAddress ])

    const cancelRequestCallback = useCallback(() => {
        return cancelVaultTransferCallback({
            api: api!,
            requestToCancel: requestToCancel!,
            signerId: accounts!.current!.address,
            setSignAndSubmit: setCancelSignAndSubmit
        })
    }, [ accounts, api, requestToCancel, setCancelSignAndSubmit ]);

    const onCancelSuccessCallback = useCallback(() => {
        setVaultRecoveryRequest(null)
        return onCancelVaultTransferSuccessCallback({
            requestToCancel: requestToCancel!,
            axiosFactory: axiosFactory!,
            refresh: refresh!,
            setSignAndSubmit: setCancelSignAndSubmit,
            setRequestToCancel,
        })
    }, [ requestToCancel, axiosFactory, setRequestToCancel, refresh ]);

    if (recoveredVaultAddress === null || availableLegalOfficers === undefined || !targetVaultAddress || vaultRecoveryRequest === undefined) {
        return null;
    }

    const coinBalances: CoinBalance[] = (vaultBalances !== null) ? vaultBalances : [];
    return (<>
            <div className="VaultRecoveryProcessTab content">
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
                                content={ coinBalance.available.coefficient.toFixedPrecision(2) } />,
                            width: "300px",
                            align: 'right',
                        },
                        {
                            header: "Action",
                            render: coinBalance => <>
                                { vaultRecoveryRequest && (vaultRecoveryRequest.status === 'REJECTED' || vaultRecoveryRequest.status === 'PENDING') ?
                                    <ButtonGroup>
                                        <VaultTransferRequestStatusCell status={ vaultRecoveryRequest.status }
                                                                        viewer="Wallet User" />
                                        <Cell content={ <Clickable
                                            onClick={ () => setRequestToCancel(vaultRecoveryRequest) }
                                        >
                                            <Icon icon={ { id: "ko" } } />
                                        </Clickable> } />
                                    </ButtonGroup>
                                    :
                                    <Button
                                        variant="recovery"
                                        onClick={ () => {
                                            setRecoveredCoinBalance(coinBalance);
                                            setStatus(Status.TRANSFERRING)
                                        } }
                                    >
                                        Transfer
                                    </Button>
                                }
                            </>,
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
                        disabled: requestSignAndSubmit !== null && !requestFailed,
                    },
                    {
                        id: "transfer",
                        buttonText: "Transfer",
                        buttonVariant: "recovery",
                        callback: () => recoverCoin(amountToRecover),
                        disabled: status !== Status.TRANSFERRING || requestSignAndSubmit !== null || legalOfficer === null,
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
                    asyncSignAndSubmit={ requestSignAndSubmit }
                    onSuccess={ onTransferSuccessCallback }
                    onError={ () => setRequestFailed(true) }
                />
            </Dialog>
            <Dialog
                show={ requestToCancel !== null }
                actions={[
                    {
                        buttonText: "Cancel",
                        buttonVariant: "secondary-polkadot",
                        id: "cancel",
                        callback: () => { setRequestToCancel(null); setCancelSignAndSubmit(null) },
                        disabled: cancelSignAndSubmit !== null && !cancelFailed
                    },
                    {
                        buttonText: "Proceed",
                        buttonVariant: "polkadot",
                        id: "proceed",
                        callback: cancelRequestCallback,
                        disabled: cancelSignAndSubmit !== null
                    }
                ]}
                size="lg"
            >
                <h2>Cancel vault recovery</h2>

                <p>This will cancel the vault recovery. Your Legal Officer will be notified.</p>

                <ExtrinsicSubmitter
                    id="cancel"
                    signAndSubmit={ cancelSignAndSubmit }
                    onSuccess={ onCancelSuccessCallback }
                    onError={ () => setCancelFailed(true) }
                />
            </Dialog>
        </>
    )
}
