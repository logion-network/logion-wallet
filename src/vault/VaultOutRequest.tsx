import { useCallback, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { Numbers, Lgnt, ValidAccountId, Fees } from "@logion/node-api";
import { VaultState } from "@logion/client";

import AmountControl, { Amount, validateAmount } from "../common/AmountControl";
import Button from "../common/Button";
import { useCommonContext } from "../common/CommonContext";
import Dialog from "../common/Dialog";
import FormGroup from "../common/FormGroup";
import Icon from "../common/Icon";
import Select, { OptionType } from "../common/Select";
import { CallCallback, useLogionChain } from "../logion-chain";

import { buildOptions } from '../wallet-user/protection/SelectLegalOfficer';
import { useUserContext } from "../wallet-user/UserContext";
import ExtrinsicSubmissionStateView from "src/ExtrinsicSubmissionStateView";
import EstimatedFees from "../loc/fees/EstimatedFees";

interface FormValues {
    amount: Amount;
    destination: string;
}

export default function VaultOutRequest() {
    const { accounts, getOfficer, signer, client, submitCall, clearSubmissionState, extrinsicSubmissionState } = useLogionChain();
    const { availableLegalOfficers, colorTheme } = useCommonContext();
    const { protectionState, mutateVaultState, vaultState } = useUserContext();

    const [ showDialog, setShowDialog ] = useState(false);
    const [ legalOfficersOptions, setLegalOfficersOptions ] = useState<OptionType<ValidAccountId>[]>([]);
    const [ legalOfficer, setLegalOfficer ] = useState<ValidAccountId | null>(null);
    const [ legalOfficerError, setLegalOfficerError ] = useState<string>();
    const [ fees, setFees ] = useState<Fees>();

    const createParams = useCallback((formValues: FormValues) => {
        return {
            legalOfficer: getOfficer!(legalOfficer!)!,
            amount: Lgnt.fromPrefixedNumber(new Numbers.PrefixedNumber(formValues.amount.value, formValues.amount.unit)),
            destination: ValidAccountId.polkadot(formValues.destination),
        }
    }, [ getOfficer, legalOfficer ]);

    useEffect(() => {
        if (legalOfficersOptions.length === 0 && protectionState && availableLegalOfficers) {
            const protectingLegalOfficers = protectionState.protectionParameters.legalOfficers.map(legalOfficer => legalOfficer.account.address);
            const candidates = availableLegalOfficers.filter(legalOfficer => protectingLegalOfficers.includes(legalOfficer.account.address));
            buildOptions(candidates)
                .then(options => setLegalOfficersOptions(options));
        }
    }, [ availableLegalOfficers, legalOfficersOptions, protectionState ]);

    const { getValues, control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        defaultValues: {
            amount: {
                value: "",
                unit: Numbers.NONE
            },
            destination: accounts?.current?.accountId.address || "",
        }
    });

    useEffect(() => {
        if (fees === undefined) {
            const params = createParams(getValues());
            vaultState?.estimateFeesCreateVaultTransferRequest(params)
                .then(setFees);
        }
    }, [ createParams, fees, getValues, vaultState ])


    const close = useCallback(() => {
        reset();
        setShowDialog(false);
    }, [ reset ]);

    const transferCallback = useCallback(async (formValues: FormValues) => {
        if(!legalOfficer) {
            setLegalOfficerError("You must select a Legal Officer");
            return;
        }

        const call = async (callback: CallCallback) => {
            await mutateVaultState(async (state: VaultState) => {
                const payload = createParams(formValues);
                return await state.createVaultTransferRequest({
                    payload,
                    signer: signer!,
                    callback,
                });
            })
        };
        try {
            await submitCall(call);
            close();
        } finally {
            clearSubmissionState();
        }
    }, [ mutateVaultState, signer, submitCall, clearSubmissionState, close, legalOfficer, createParams ]);

    if(availableLegalOfficers === undefined || !client) {
        return null;
    }

    return (
        <>
            <Button className="request-vault-out" onClick={ () => setShowDialog(true) } slim>
                <Icon icon={ { id: 'vault-out' } } /> Withdraw from vault
            </Button>
            <Dialog
                show={ showDialog }
                size="lg"
                actions={[
                    {
                        buttonText: "Cancel",
                        id: "cancel",
                        buttonVariant: "secondary",
                        callback: close,
                        disabled: extrinsicSubmissionState.inProgress && !extrinsicSubmissionState.isError()
                    },
                    {
                        buttonText: "Withdraw",
                        id: "withdraw",
                        buttonVariant: "polkadot",
                        type: 'submit',
                        disabled: extrinsicSubmissionState.inProgress
                    }
                ]}
                onSubmit={ handleSubmit(transferCallback) }
            >
                <h2>Withdraw { Lgnt.CODE }s from your logion Vault</h2>

                { !extrinsicSubmissionState.inProgress &&
                <>
                    <FormGroup
                        id="destination"
                        label="Destination"
                        control={
                            <Controller
                                name="destination"
                                control={ control }
                                rules={{
                                    validate: address => {
                                        if(client.isValidAddress(address)) {
                                            return undefined;
                                        } else {
                                            return "Invalid destination";
                                        }
                                    }
                                }}
                                render={ ({ field }) => (
                                    <Form.Control
                                        isInvalid={ !!errors.destination?.message }
                                        type="text"
                                        placeholder="The beneficiary's SS58 address"
                                        value={ field.value }
                                        onChange={ field.onChange }
                                    />
                                )}
                            />
                        }
                        feedback={ errors.destination?.message }
                        colors={ colorTheme.dialog }
                        help={`The default destination is your regular address, carefully check the destination if you change this value.`}
                    />

                    <FormGroup
                        id="amount"
                        label="Amount"
                        control={
                            <Controller
                                name="amount"
                                control={ control }
                                rules={{
                                    validate: validateAmount
                                }}
                                render={ ({ field }) => (
                                    <AmountControl
                                        isInvalid={ !!errors.amount?.message }
                                        value={ field.value }
                                        onChange={ field.onChange }
                                        placeholder="The amount to transfer"
                                    />
                                )}
                            />
                        }
                        feedback={ errors.amount?.message }
                        colors={ colorTheme.dialog }
                    />

                    <FormGroup
                        id="legalOfficer"
                        label="Legal officer"
                        control={
                            <Select
                                isInvalid={ !!legalOfficerError }
                                options={ legalOfficersOptions }
                                value={ legalOfficer }
                                onChange={ value => { setLegalOfficerError(undefined) ; setLegalOfficer(value) } }
                            />
                        }
                        feedback={ legalOfficerError }
                        colors={ colorTheme.dialog }
                    />
                </>
                }

                <EstimatedFees fees={ fees }/>

                <ExtrinsicSubmissionStateView />
            </Dialog>
        </>
    )
}
