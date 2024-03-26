import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { CoinBalance, Numbers, Lgnt } from "@logion/node-api";
import { ProtectionState, VaultState, VaultTransferRequest } from "@logion/client";

import { CallCallback, useLogionChain } from "../../logion-chain";

import { useCommonContext } from "../../common/CommonContext";
import Button from "../../common/Button";
import Dialog from "../../common/Dialog";
import Icon from "../../common/Icon";
import Table, { Cell, EmptyTableMessage } from "../../common/Table";
import Select, { OptionType } from "../../common/Select";
import FormGroup from "../../common/FormGroup";
import VaultTransferRequestStatusCell from "../../common/VaultTransferRequestStatusCell";
import Clickable from "../../common/Clickable";
import ButtonGroup from "../../common/ButtonGroup";

import { useUserContext } from "../UserContext";

import { buildOptions } from "./SelectLegalOfficer";
import "./VaultRecoveryProcessTab.css"
import CoinIcon from "src/components/coin/CoinIcon";
import ExtrinsicSubmissionStateView from "src/ExtrinsicSubmissionStateView";
import AmountCell from "src/common/AmountCell";
import AssetNameCell from "src/common/AssetNameCell";

interface FormValues {
    legalOfficer: string | null;
}

enum Status {
    IDLE,
    TRANSFERRING,
}

function legalOfficers(protectionState: ProtectionState): string[] {
    return protectionState.protectionParameters.states.map(state => state.legalOfficer.address);
}

export default function VaultRecoveryProcessTab() {

    const { getOfficer, signer, submitCall, clearSubmissionState, extrinsicSubmissionState } = useLogionChain();
    const { colorTheme, availableLegalOfficers } = useCommonContext();
    const { protectionState, vaultState, mutateRecoveredVaultState, recoveredVaultState } = useUserContext();
    const [ recoveredCoinBalance, setRecoveredCoinBalance ] = useState<CoinBalance | null>(null);
    const [ legalOfficer, setLegalOfficer ] = useState<string | null>(null);
    const [ status, setStatus ] = useState<Status>(Status.IDLE);
    const [ requestToCancel, setRequestToCancel ] = useState<VaultTransferRequest | null>(null);
    const [ legalOfficersOptions, setLegalOfficersOptions ] = useState<OptionType<string>[]>([]);

    useEffect(() => {
        if (legalOfficersOptions.length === 0 && protectionState && availableLegalOfficers) {
            const addresses = legalOfficers(protectionState);
            const candidates = availableLegalOfficers.filter(legalOfficer => addresses.includes(legalOfficer.address));
            buildOptions(candidates)
                .then(options => setLegalOfficersOptions(options));
        }
    }, [ legalOfficersOptions, setLegalOfficersOptions, availableLegalOfficers, protectionState ])

    const { control, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            legalOfficer: null
        }
    });

    const clearFormCallback = useCallback(() => {
        setRecoveredCoinBalance(null);
        setLegalOfficer(null);
        setStatus(Status.IDLE);
        clearSubmissionState();
        setRequestToCancel(null);
    }, [ clearSubmissionState ]);

    const amountToRecover = useMemo<Numbers.PrefixedNumber>(() => recoveredCoinBalance?.available ?
            recoveredCoinBalance?.available :
            new Numbers.PrefixedNumber("0", Numbers.NONE),
        [ recoveredCoinBalance ])

    const vaultRecoveryRequest = useMemo<VaultTransferRequest | null>(() => {
        if(recoveredVaultState) {
            const pendingOrRejected = recoveredVaultState.pendingVaultTransferRequests.concat(recoveredVaultState.rejectedVaultTransferRequests);
            if(pendingOrRejected.length > 0) {
                return pendingOrRejected[0];
            } else {
                return null;
            }
        } else {
            return null;
        }
    },
    [ recoveredVaultState ]);

    const recoverCoin = useCallback(async (amount: Numbers.PrefixedNumber) => {
        const call = async (callback: CallCallback) => {
            await mutateRecoveredVaultState(async (recoveredVaultState: VaultState) => {
                return await recoveredVaultState.createVaultTransferRequest({
                    legalOfficer: getOfficer!(legalOfficer!)!,
                    amount: Lgnt.fromPrefixedNumber(amount),
                    destination: vaultState!.vaultAddress,
                    signer: signer!,
                    callback,
                });
            })
        }
        try {
            await submitCall(call);
            clearFormCallback();
        } catch(_) {
            // State cleared on close
        }
    }, [ mutateRecoveredVaultState, getOfficer, legalOfficer, signer, vaultState, clearFormCallback, submitCall ]);

    const cancelRequestCallback = useCallback(async () => {
        const call = async (callback: CallCallback) => {
            await mutateRecoveredVaultState(async (vaultState: VaultState) => {
                return await vaultState.cancelVaultTransferRequest(
                    getOfficer!(requestToCancel!.legalOfficerAddress)!,
                    requestToCancel!,
                    signer!,
                    callback,
                );
            })
        }
        try {
            await submitCall(call);
            clearFormCallback();
        } catch(_) {
            // State cleared on close
        }
    }, [ requestToCancel, getOfficer, signer, mutateRecoveredVaultState, submitCall, clearFormCallback ]);

    if (!vaultState || !recoveredVaultState || availableLegalOfficers === undefined) {
        return null;
    }

    const coinBalances: CoinBalance[] = recoveredVaultState ? recoveredVaultState.balances.filter(balance => balance.available.toNumber() > 0) : [];
    return (<>
            <div className="VaultRecoveryProcessTab content">
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
                                recoveredVaultState &&
                                "No coin to recover"
                            }
                            {
                                !recoveredVaultState &&
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
                        disabled: extrinsicSubmissionState.inProgress,
                    },
                    {
                        id: "transfer",
                        buttonText: "Transfer",
                        buttonVariant: "recovery",
                        callback: () => recoverCoin(amountToRecover),
                        disabled: !extrinsicSubmissionState.canSubmit() || extrinsicSubmissionState.isError(),
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
                                        options={ legalOfficersOptions }
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
                        <br />from account { recoveredVaultState?.vaultAddress }
                        <br />to account { vaultState.vaultAddress }.
                    </p>
                </>
                }
                <ExtrinsicSubmissionStateView />
            </Dialog>
            <Dialog
                show={ requestToCancel !== null }
                actions={[
                    {
                        buttonText: "Cancel",
                        buttonVariant: "secondary-polkadot",
                        id: "cancel",
                        callback: clearFormCallback,
                        disabled: extrinsicSubmissionState.inProgress,
                    },
                    {
                        buttonText: "Proceed",
                        buttonVariant: "polkadot",
                        id: "proceed",
                        callback: cancelRequestCallback,
                        disabled: !extrinsicSubmissionState.canSubmit() || extrinsicSubmissionState.isError(),
                    }
                ]}
                size="lg"
            >
                <h2>Cancel vault recovery</h2>

                <p>This will cancel the vault recovery. Your Legal Officer will be notified.</p>

                <ExtrinsicSubmissionStateView />
            </Dialog>
        </>
    )
}
