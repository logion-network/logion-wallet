import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import AmountControl, { Amount, validateAmount } from "../common/AmountControl";
import Button from "../common/Button";
import { useCommonContext } from "../common/CommonContext";
import Dialog from "../common/Dialog";
import FormGroup from "../common/FormGroup";
import Icon from "../common/Icon";
import Select from "../common/Select";
import ExtrinsicSubmitter, { AsyncSignAndSubmit, SuccessfulTransaction } from "../ExtrinsicSubmitter";
import { useLogionChain } from "../logion-chain";
import { LGNT_SMALLEST_UNIT, SYMBOL } from "../logion-chain/Balances";
import { NONE, PrefixedNumber } from "../logion-chain/numbers";
import { getRecoveryConfig } from "../logion-chain/Recovery";
import { requestVaultTransfer } from "../logion-chain/Vault";
import { isValidAccountId } from '../logion-chain/Accounts';

import { buildOptions } from '../wallet-user/trust-protection/SelectLegalOfficer';
import { Form } from "react-bootstrap";
import { VaultApi } from "./VaultApi";

interface FormValues {
    legalOfficer: string;
    amount: Amount;
    destination: string;
}

export default function VaultOutRequest() {
    const { api } = useLogionChain();
    const { availableLegalOfficers, colorTheme, accounts, axiosFactory } = useCommonContext();

    const [ showDialog, setShowDialog ] = useState(false);
    const [ signAndSubmit, setSignAndSubmit ] = useState<AsyncSignAndSubmit>(null);
    const [ formValues, setFormValues ] = useState<FormValues | null>(null);
    const [ showConfirmation, setShowConfirmation ] = useState(false);
    const [ failed, setFailed ] = useState(false);

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

        const signAndSubmit: AsyncSignAndSubmit = (setResult, setError) => requestVaultTransfer({
            api: api!,
            amount: new PrefixedNumber(formValues.amount.value, formValues.amount.unit),
            destination: formValues.destination,
            signerId,
            recoveryConfig: recoveryConfig.unwrap(),
            callback: setResult,
            errorCallback: setError
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
        const vaultApi = new VaultApi(axios);
        const requesterAddress = accounts!.current!.address;
        const blockHeader = await api!.rpc.chain.getHeader(submittable.block);
        await vaultApi.createVaultTransferRequest({
            amount: new PrefixedNumber(formValues!.amount.value, formValues!.amount.unit).convertTo(LGNT_SMALLEST_UNIT).coefficient.unnormalize(),
            destination: formValues!.destination,
            block: blockHeader.number.toString(),
            index: submittable.index,
            requesterAddress,
        });
        setShowDialog(false);
        setShowConfirmation(true);
    }, [ cleanUpCallback, formValues, accounts, api, axiosFactory ]);

    const cancelCallback = useCallback(() => {
        cleanUpCallback();
        setShowDialog(false);
    }, [ cleanUpCallback, setShowDialog ]);

    if(availableLegalOfficers === undefined) {
        return null;
    }

    return (
        <>
            <Button onClick={ () => setShowDialog(true) } >
                <Icon icon={ { id: 'vault-out' } } /> Request a vault-out transfer
            </Button>
            <Dialog
                show={ showDialog }
                size="lg"
                actions={[
                    {
                        buttonText: "Cancel",
                        id: "cancel",
                        buttonVariant: "secondary",
                        callback: cancelCallback,
                        disabled: signAndSubmit !== null && !failed
                    },
                    {
                        buttonText: "Transfer",
                        id: "transfer",
                        buttonVariant: "primary",
                        type: 'submit',
                        disabled: signAndSubmit !== null
                    }
                ]}
                onSubmit={ handleSubmit(transferCallback) }
            >
                <h2>Transfer { SYMBOL }n from your logion Vault</h2>

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
                                        options={ buildOptions(availableLegalOfficers) }
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
                    asyncSignAndSubmit={ signAndSubmit }
                    onSuccess={ onExtrinsicSuccessCallback }
                    onError={ () => setFailed(true) }
                />
            </Dialog>
            <Dialog
                show={ showConfirmation }
                size="lg"
                actions={[
                    {
                        buttonText: "OK",
                        id: "ok",
                        buttonVariant: "primary",
                        callback: () => setShowConfirmation(false)
                    }
                ]}
            >
                <h2>Transfer { SYMBOL }n from your logion Vault</h2>

                <p>Your transfer request has been submitted to your Legal Officer.</p>
            </Dialog>
        </>
    )
}
