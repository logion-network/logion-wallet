import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { CoinBalance, PrefixedNumber, NONE } from "@logion/node-api";
import { LegalOfficer, ProtectionState, VaultState, VaultTransferRequest } from "@logion/client";

import { useLogionChain } from "../../logion-chain";

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
import ButtonGroup from "../../common/ButtonGroup";

import { useUserContext } from "../UserContext";

import { buildOptions } from "./SelectLegalOfficer";
import "./VaultRecoveryProcessTab.css"
import ClientExtrinsicSubmitter, { Call, CallCallback } from "../../ClientExtrinsicSubmitter";

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

    const { getOfficer, signer } = useLogionChain();
    const { colorTheme, availableLegalOfficers } = useCommonContext();
    const { protectionState, vaultState, mutateRecoveredVaultState, recoveredVaultState } = useUserContext();
    const [ recoveredCoinBalance, setRecoveredCoinBalance ] = useState<CoinBalance | null>(null);
    const [ legalOfficer, setLegalOfficer ] = useState<string | null>(null);
    const [ status, setStatus ] = useState<Status>(Status.IDLE);
    const [ requestSignAndSubmit, setRequestSignAndSubmit ] = useState<Call>();
    const [ requestFailed, setRequestFailed ] = useState<boolean>(false);
    const [ candidates, setCandidates ] = useState<LegalOfficer[]>([]);
    const [ requestToCancel, setRequestToCancel ] = useState<VaultTransferRequest | null>(null);
    const [ cancelSignAndSubmit, setCancelSignAndSubmit ] = useState<Call>();
    const [ cancelFailed, setCancelFailed ] = useState(false);

    useEffect(() => {
        if (candidates.length === 0 && protectionState && availableLegalOfficers) {
            const addresses = legalOfficers(protectionState);
            setCandidates(availableLegalOfficers.filter(legalOfficer => addresses.includes(legalOfficer.address)));
        }
    }, [ candidates, setCandidates, availableLegalOfficers, protectionState ])

    const { control, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            legalOfficer: null
        }
    });

    const clearFormCallback = useCallback(() => {
        setRecoveredCoinBalance(null);
        setRequestSignAndSubmit(undefined);
        setCancelSignAndSubmit(undefined);
        setRequestFailed(false);
        setCancelFailed(false);
        setLegalOfficer(null);
        setStatus(Status.IDLE);
    }, [ setRecoveredCoinBalance, setRequestSignAndSubmit, setCancelSignAndSubmit, setRequestFailed ])

    const amountToRecover = useMemo<PrefixedNumber>(() => recoveredCoinBalance?.available ?
            recoveredCoinBalance?.available :
            new PrefixedNumber("0", NONE),
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

    const recoverCoin = useCallback(async (amount: PrefixedNumber) => {
        const signAndSubmit: Call = async (callback: CallCallback) => {
            await mutateRecoveredVaultState(async (recoveredVaultState: VaultState) => {
                return await recoveredVaultState.createVaultTransferRequest({
                    legalOfficer: getOfficer!(legalOfficer!)!,
                    amount,
                    destination: vaultState!.vaultAddress,
                    signer: signer!,
                    callback,
                });
            })
        }
        setRequestSignAndSubmit(() => signAndSubmit)
    }, [ mutateRecoveredVaultState, getOfficer, legalOfficer, signer, setRequestSignAndSubmit, vaultState ])

    const onTransferSuccessCallback = useCallback(() => {
        clearFormCallback();
    }, [ clearFormCallback ])

    const cancelRequestCallback = useCallback(async () => {
        const signAndSubmit: Call = async (callback: CallCallback) => {
            await mutateRecoveredVaultState(async (vaultState: VaultState) => {
                return await vaultState.cancelVaultTransferRequest(
                    getOfficer!(requestToCancel!.legalOfficerAddress)!,
                    requestToCancel!,
                    signer!,
                    callback,
                );
            })
        }
        setCancelSignAndSubmit(() => signAndSubmit)
    }, [ requestToCancel, setCancelSignAndSubmit, getOfficer, signer, mutateRecoveredVaultState ]);

    const onCancelSuccessCallback = useCallback(() => {
        setRequestToCancel(null);
    }, [ setRequestToCancel ]);

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
                        disabled: requestSignAndSubmit !== undefined && !requestFailed,
                    },
                    {
                        id: "transfer",
                        buttonText: "Transfer",
                        buttonVariant: "recovery",
                        callback: () => recoverCoin(amountToRecover),
                        disabled: status !== Status.TRANSFERRING || requestSignAndSubmit !== undefined || legalOfficer === null,
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
                        <br />from account { recoveredVaultState?.vaultAddress }
                        <br />to account { vaultState.vaultAddress }.
                    </p>
                </>
                }
                <ClientExtrinsicSubmitter
                    call={ requestSignAndSubmit }
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
                        callback: () => { setRequestToCancel(null); setCancelSignAndSubmit(undefined) },
                        disabled: cancelSignAndSubmit !== undefined && !cancelFailed
                    },
                    {
                        buttonText: "Proceed",
                        buttonVariant: "polkadot",
                        id: "proceed",
                        callback: cancelRequestCallback,
                        disabled: cancelSignAndSubmit !== undefined
                    }
                ]}
                size="lg"
            >
                <h2>Cancel vault recovery</h2>

                <p>This will cancel the vault recovery. Your Legal Officer will be notified.</p>

                <ClientExtrinsicSubmitter
                    call={ cancelSignAndSubmit }
                    onSuccess={ onCancelSuccessCallback }
                    onError={ () => setCancelFailed(true) }
                />
            </Dialog>
        </>
    )
}
