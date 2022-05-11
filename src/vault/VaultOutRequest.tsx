import { useCallback, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { LGNT_SMALLEST_UNIT, SYMBOL } from "@logion/node-api/dist/Balances";
import { NONE, PrefixedNumber } from "@logion/node-api/dist/numbers";
import { getRecoveryConfig } from "@logion/node-api/dist/Recovery";
import { requestVaultTransfer } from "@logion/node-api/dist/Vault";
import { isValidAccountId } from '@logion/node-api/dist/Accounts';

import AmountControl, { Amount, validateAmount } from "../common/AmountControl";
import Button from "../common/Button";
import { useCommonContext } from "../common/CommonContext";
import Dialog from "../common/Dialog";
import FormGroup from "../common/FormGroup";
import Icon from "../common/Icon";
import Select from "../common/Select";
import ExtrinsicSubmitter, { SignAndSubmit, SuccessfulTransaction } from "../ExtrinsicSubmitter";
import { useLogionChain } from "../logion-chain";

import { buildOptions } from '../wallet-user/trust-protection/SelectLegalOfficer';
import { VaultApi } from "./VaultApi";
import { LegalOfficer } from "../directory/DirectoryApi";
import { signAndSend } from "src/logion-chain/Signature";

interface FormValues {
    legalOfficer: string;
    amount: Amount;
    destination: string;
}

export default function VaultOutRequest() {
    const { api } = useLogionChain();
    const { availableLegalOfficers, colorTheme, accounts, axiosFactory, refresh } = useCommonContext();

    const [ showDialog, setShowDialog ] = useState(false);
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ formValues, setFormValues ] = useState<FormValues | null>(null);
    const [ failed, setFailed ] = useState(false);
    const [ candidates, setCandidates ] = useState<LegalOfficer[]>([]);

    useEffect(() => {
        if(accounts && api) {
            (async function() {
                const accountId = accounts!.current!.address;
                const recoveryConfig = await getRecoveryConfig({
                    api: api!,
                    accountId
                });
                if(availableLegalOfficers && recoveryConfig) {
                    setCandidates(availableLegalOfficers.filter(legalOfficer => recoveryConfig.legalOfficers.includes(legalOfficer.address)));
                }
            })();
        }
    }, [ accounts, api, availableLegalOfficers, setCandidates ]);

    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        defaultValues: {
            legalOfficer: "",
            amount: {
                value: "",
                unit: NONE
            },
            destination: ""
        }
    });

    const transferCallback = useCallback(async (formValues: FormValues) => {
        setFormValues(formValues);

        const signerId = accounts!.current!.address;
        const recoveryConfig = await getRecoveryConfig({
            api: api!,
            accountId: signerId
        });

        const submittable = await requestVaultTransfer({
            signerId,
            api: api!,
            amount: new PrefixedNumber(formValues.amount.value, formValues.amount.unit),
            destination: formValues.destination,
            recoveryConfig: recoveryConfig!,
        });

        const signAndSubmit: SignAndSubmit = (setResult, setError) => signAndSend({
            signerId,
            callback: setResult,
            errorCallback: setError,
            submittable,
        });
        setSignAndSubmit(() => signAndSubmit);
    }, [ api, accounts, setFormValues ]);

    const cleanUpCallback = useCallback(() => {
        setSignAndSubmit(null);
        reset();
    }, [ setSignAndSubmit, reset ]);

    const onExtrinsicSuccessCallback = useCallback(async (_id: string, submittable: SuccessfulTransaction) => {
        cleanUpCallback();

        const axios = axiosFactory!(formValues!.legalOfficer);
        const vaultApi = new VaultApi(axios, formValues!.legalOfficer);
        const requesterAddress = accounts!.current!.address;
        const blockHeader = await api!.rpc.chain.getHeader(submittable.block);
        await vaultApi.createVaultTransferRequest({
            amount: new PrefixedNumber(formValues!.amount.value, formValues!.amount.unit).convertTo(LGNT_SMALLEST_UNIT).coefficient.unnormalize(),
            destination: formValues!.destination,
            block: blockHeader.number.toString(),
            index: submittable.index,
            origin: requesterAddress,
        });
        setShowDialog(false);
        refresh();
    }, [ cleanUpCallback, formValues, accounts, api, axiosFactory, refresh ]);

    const cancelCallback = useCallback(() => {
        cleanUpCallback();
        setShowDialog(false);
    }, [ cleanUpCallback, setShowDialog ]);

    if(availableLegalOfficers === undefined) {
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
                        disabled: signAndSubmit !== null && !failed
                    },
                    {
                        buttonText: "Transfer",
                        id: "transfer",
                        buttonVariant: "polkadot",
                        type: 'submit',
                        disabled: signAndSubmit !== null
                    }
                ]}
                onSubmit={ handleSubmit(transferCallback) }
            >
                <h2>Transfer { SYMBOL }s from your logion Vault</h2>

                { signAndSubmit === null &&
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
                                        if(isValidAccountId(api!, address)) {
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

                <ExtrinsicSubmitter
                    id="vaultTransfer"
                    signAndSubmit={ signAndSubmit }
                    onSuccess={ onExtrinsicSuccessCallback }
                    onError={ () => setFailed(true) }
                />
            </Dialog>
        </>
    )
}
