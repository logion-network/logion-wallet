import { useCallback, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { Numbers, Lgnt } from "@logion/node-api";
import { LegalOfficer, VaultState } from "@logion/client";

import AmountControl, { Amount, validateAmount } from "../common/AmountControl";
import Button from "../common/Button";
import { useCommonContext } from "../common/CommonContext";
import Dialog from "../common/Dialog";
import FormGroup from "../common/FormGroup";
import Icon from "../common/Icon";
import Select from "../common/Select";
import { useLogionChain } from "../logion-chain";

import { buildOptions } from '../wallet-user/trust-protection/SelectLegalOfficer';
import { useUserContext } from "../wallet-user/UserContext";
import ClientExtrinsicSubmitter, { Call, CallCallback } from "src/ClientExtrinsicSubmitter";

interface FormValues {
    legalOfficer: string;
    amount: Amount;
    destination: string;
}

export default function VaultOutRequest() {
    const { api, accounts, getOfficer, signer, client } = useLogionChain();
    const { availableLegalOfficers, colorTheme } = useCommonContext();
    const { protectionState, mutateVaultState } = useUserContext();

    const [ showDialog, setShowDialog ] = useState(false);
    const [ signAndSubmit, setSignAndSubmit ] = useState<Call>();
    const [ failed, setFailed ] = useState(false);
    const [ candidates, setCandidates ] = useState<LegalOfficer[]>([]);

    useEffect(() => {
        if(availableLegalOfficers && protectionState) {
            const protectingLegalOfficers = protectionState.protectionParameters.states.map(state => state.legalOfficer.address);
            setCandidates(availableLegalOfficers.filter(legalOfficer => protectingLegalOfficers.includes(legalOfficer.address)));
        }
    }, [ accounts, api, availableLegalOfficers, setCandidates, protectionState ]);

    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        defaultValues: {
            legalOfficer: "",
            amount: {
                value: "",
                unit: Numbers.NONE
            },
            destination: ""
        }
    });

    const transferCallback = useCallback(async (formValues: FormValues) => {
        const signAndSubmit: Call = async (callback: CallCallback) => {
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
        setSignAndSubmit(() => signAndSubmit);
    }, [ getOfficer, mutateVaultState, signer ]);

    const cleanUpCallback = useCallback(() => {
        setSignAndSubmit(undefined);
        reset();
    }, [ setSignAndSubmit, reset ]);

    const onExtrinsicSuccessCallback = useCallback(async () => {
        cleanUpCallback();
        setShowDialog(false);
    }, [ cleanUpCallback, setShowDialog ]);

    const cancelCallback = useCallback(() => {
        cleanUpCallback();
        setShowDialog(false);
    }, [ cleanUpCallback, setShowDialog ]);

    if(availableLegalOfficers === undefined || !client) {
        return null;
    }

    return (
        <>
            <Button className="request-vault-out" onClick={ () => setShowDialog(true) } >
                <Icon icon={ { id: 'vault-out' } } /> Request a vault-out transfer
            </Button>
            <Dialog
                show={ showDialog }
                size="lg"
                actions={[
                    {
                        buttonText: "Cancel",
                        id: "cancel",
                        buttonVariant: "secondary-polkadot",
                        callback: cancelCallback,
                        disabled: signAndSubmit !== undefined && !failed
                    },
                    {
                        buttonText: "Transfer",
                        id: "transfer",
                        buttonVariant: "polkadot",
                        type: 'submit',
                        disabled: signAndSubmit !== undefined
                    }
                ]}
                onSubmit={ handleSubmit(transferCallback) }
            >
                <h2>Transfer { Lgnt.CODE }s from your logion Vault</h2>

                { signAndSubmit === undefined &&
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
                                        options={ buildOptions(candidates) }
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

                <ClientExtrinsicSubmitter
                    call={ signAndSubmit }
                    onSuccess={ onExtrinsicSuccessCallback }
                    onError={ () => setFailed(true) }
                />
            </Dialog>
        </>
    )
}
