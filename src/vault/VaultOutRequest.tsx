import { useCallback, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { Numbers, Lgnt } from "@logion/node-api";
import { VaultState } from "@logion/client";

import AmountControl, { Amount, validateAmount } from "../common/AmountControl";
import Button from "../common/Button";
import { useCommonContext } from "../common/CommonContext";
import Dialog from "../common/Dialog";
import FormGroup from "../common/FormGroup";
import Icon from "../common/Icon";
import Select, { OptionType } from "../common/Select";
import { CallCallback, useLogionChain } from "../logion-chain";

import { buildOptions } from '../wallet-user/trust-protection/SelectLegalOfficer';
import { useUserContext } from "../wallet-user/UserContext";
import ExtrinsicSubmissionStateView from "src/ExtrinsicSubmissionStateView";

interface FormValues {
    legalOfficer: string;
    amount: Amount;
    destination: string;
}

export default function VaultOutRequest() {
    const { api, accounts, getOfficer, signer, client, submitCall, clearSubmissionState, extrinsicSubmissionState } = useLogionChain();
    const { availableLegalOfficers, colorTheme } = useCommonContext();
    const { protectionState, mutateVaultState } = useUserContext();

    const [ showDialog, setShowDialog ] = useState(false);
    const [ legalOfficersOptions, setLegalOfficersOptions ] = useState<OptionType<string>[]>([]);

    useEffect(() => {
        if (legalOfficersOptions.length === 0 && protectionState && availableLegalOfficers) {
            const protectingLegalOfficers = protectionState.protectionParameters.legalOfficers.map(legalOfficer => legalOfficer.address);
            const candidates = availableLegalOfficers.filter(legalOfficer => protectingLegalOfficers.includes(legalOfficer.address));
            buildOptions(candidates)
                .then(options => setLegalOfficersOptions(options));
        }
    }, [ accounts, api, availableLegalOfficers, legalOfficersOptions, setLegalOfficersOptions, protectionState ]);

    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        defaultValues: {
            legalOfficer: "",
            amount: {
                value: "",
                unit: Numbers.NONE
            },
            destination: accounts?.current?.accountId.address || "",
        }
    });

    const close = useCallback(() => {
        reset();
        setShowDialog(false);
    }, [ reset ]);

    const transferCallback = useCallback(async (formValues: FormValues) => {
        const call = async (callback: CallCallback) => {
            await mutateVaultState(async (state: VaultState) => {
                return await state.createVaultTransferRequest({
                    legalOfficer: getOfficer!(formValues!.legalOfficer)!,
                    amount: Lgnt.fromPrefixedNumber(new Numbers.PrefixedNumber(formValues.amount.value, formValues.amount.unit)),
                    destination: formValues.destination,
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
    }, [ getOfficer, mutateVaultState, signer, submitCall, clearSubmissionState, close ]);

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
                                        //@ts-ignore
                                        isInvalid={ !!errors.amount?.message }
                                        value={ field.value }
                                        onChange={ field.onChange }
                                        placeholder="The amount to transfer"
                                    />
                                )}
                            />
                        }
                        //@ts-ignore
                        feedback={ errors.amount?.message }
                        colors={ colorTheme.dialog }
                    />

                    <FormGroup
                        id="legalOfficer"
                        label="Legal officer"
                        control={
                            <Controller
                                name="legalOfficer"
                                control={ control }
                                rules={{
                                    required: 'You must select a Legal Officer',
                                    minLength: {
                                        value: 1,
                                        message: 'You must select a Legal Officer'
                                    },

                                }}
                                render={({ field }) => (
                                    <Select
                                        isInvalid={ !!errors.legalOfficer?.message }
                                        options={ legalOfficersOptions }
                                        value={ field.value }
                                        onChange={ field.onChange }
                                    />
                                )}
                            />
                        }
                        feedback={ errors.legalOfficer?.message }
                        colors={ colorTheme.dialog }
                    />
                </>
                }

                <ExtrinsicSubmissionStateView />
            </Dialog>
        </>
    )
}
