import { Controller, useForm } from 'react-hook-form';
import Form from "react-bootstrap/Form";
import { Lgnt, Numbers } from "@logion/node-api";
import FormGroup from '../common/FormGroup';
import AmountControl, { Amount, validateAmount } from 'src/common/AmountControl';
import CollapsePane from 'src/components/collapsepane/CollapsePane';
import { BackgroundAndForegroundColors } from "../common/ColorTheme";
import CollectionLimitsForm, { CollectionLimits, DEFAULT_LIMITS } from "./CollectionLimitsForm";
import { useState, useCallback } from "react";
import { DraftRequest, LocsState } from "@logion/client";
import { useUserContext } from "../wallet-user/UserContext";
import ButtonGroup from "../common/ButtonGroup";
import Button from "../common/Button";
import { useLogionChain } from "../logion-chain";
import { locDetailsPath } from "../wallet-user/UserRouter";
import { useNavigate } from "react-router";

export interface FormValues {
    description: string;
    valueFee: Amount;
    collectionItemFee: Amount;
    tokensRecordFee: Amount;
    legalFee: Amount | undefined;
}

export interface Props {
    colors: BackgroundAndForegroundColors;
    legalOfficer: string | undefined;
}

export default function CollectionLocRequestForm(props: Props) {
    const [ limits, setLimits ] = useState<CollectionLimits>(DEFAULT_LIMITS);
    const { mutateLocsState } = useUserContext();
    const { client } = useLogionChain();
    const navigate = useNavigate();
    const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            description: "",
            valueFee: {
                unit: Numbers.NONE,
                value: "0",
            },
            collectionItemFee: {
                unit: Numbers.NONE,
                value: "0",
            },
            tokensRecordFee: {
                unit: Numbers.NONE,
                value: "0",
            },
            legalFee: undefined,
        }
    });

    const submit = useCallback(async (formValues: FormValues) => {

        let draftRequest: DraftRequest;
        await mutateLocsState(async (locsState: LocsState) => {
            const collectionParams = await limits.toCollectionParams(client!.logionApi);
            draftRequest = await locsState!.requestCollectionLoc({
                legalOfficerAddress: props.legalOfficer!,
                description: formValues.description,
                draft: true,
                template: undefined,
                valueFee: Lgnt.fromPrefixedNumber(new Numbers.PrefixedNumber(formValues.valueFee.value, formValues.valueFee.unit)),
                collectionItemFee: Lgnt.fromPrefixedNumber(new Numbers.PrefixedNumber(formValues.collectionItemFee.value, formValues.collectionItemFee.unit)),
                tokensRecordFee: Lgnt.fromPrefixedNumber(new Numbers.PrefixedNumber(formValues.tokensRecordFee.value, formValues.tokensRecordFee.unit)),
                legalFee: formValues.legalFee ? Lgnt.fromPrefixedNumber(new Numbers.PrefixedNumber(formValues.legalFee.value, formValues.legalFee.unit)) : undefined,
                collectionParams,
            }) as DraftRequest;
            return draftRequest.locsState();
        })
        navigate(locDetailsPath(draftRequest!.data().id, "Collection"));

    }, [ client, limits, mutateLocsState, props.legalOfficer, navigate ]);

    return (
        <>
            <FormGroup
                id="locDescription"
                label="Description"
                control={
                    <Controller
                        name="description"
                        control={ control }
                        defaultValue=""
                        rules={ {
                            required: 'The description is required',
                            minLength: {
                                value: 3,
                                message: 'The description must contain at least 3 characters'
                            },
                            maxLength: {
                                value: 40,
                                message: 'The description must contain at most 40 characters'
                            }
                        } }
                        render={ ({ field }) => (
                            <Form.Control
                                isInvalid={ !!errors.description?.message }
                                type="text" placeholder="e.g. XYZ"
                                data-testid="description"
                                aria-describedby="locDescription"
                                { ...field }
                            />
                        ) }
                    />
                }
                colors={ props.colors }
                feedback={ errors.description?.message }
            />

            <FormGroup
                id="valueFee"
                label="Value fee"
                control={
                    <Controller
                        name="valueFee"
                        control={ control }
                        rules={ {
                            validate: validateAmount
                        } }
                        render={ ({ field }) => (
                            <AmountControl
                                isInvalid={ !!errors.valueFee?.message }
                                value={ field.value }
                                onChange={ field.onChange }
                            />
                        ) }
                    />
                }
                feedback={ errors.valueFee?.message }
                colors={ props.colors }
                help={
                    `The value fee is calculated in function of the value of the asset being protected by
 this collection LOC. The details of the fee calculation must be attached to the LOC so that the Logion Legal Officer
 can review them, otherwise your request may be rejected.`
                }
            />
            <FormGroup
                id="collectionItemFee"
                label="Collection item fee"
                control={
                    <Controller
                        name="collectionItemFee"
                        control={ control }
                        rules={ {
                            validate: validateAmount
                        } }
                        render={ ({ field }) => (
                            <AmountControl
                                isInvalid={ !!errors.collectionItemFee?.message }
                                value={ field.value }
                                onChange={ field.onChange }
                            />
                        ) }
                    />
                }
                feedback={ errors.collectionItemFee?.message }
                colors={ props.colors }
                help={
                    `The collection item fee is calculated in function of the value fee. It is charged to the requester on every item creation.`
                }
            />
            <FormGroup
                id="tokensRecordFee"
                label="Tokens record fee"
                control={
                    <Controller
                        name="tokensRecordFee"
                        control={ control }
                        rules={ {
                            validate: validateAmount
                        } }
                        render={ ({ field }) => (
                            <AmountControl
                                isInvalid={ !!errors.tokensRecordFee?.message }
                                value={ field.value }
                                onChange={ field.onChange }
                            />
                        ) }
                    />
                }
                feedback={ errors.tokensRecordFee?.message }
                colors={ props.colors }
                help={
                    `The tokens record fee is calculated in function of the value fee. It is charged to the requester on every tokens record creation.`
                }
            />


            <CollectionLimitsForm
                value={ limits }
                onChange={ value => setLimits(value) }
                colors={ props.colors }
            />

            <CollapsePane
                title="Advanced creation parameters"
            >
                <FormGroup
                    id="legalFee"
                    label="Legal fee"
                    control={
                        <Controller
                            name="legalFee"
                            control={ control }
                            rules={ {
                                validate: validateAmount
                            } }
                            render={ ({ field }) => (
                                <AmountControl
                                    isInvalid={ !!errors.legalFee?.message }
                                    value={ field.value }
                                    onChange={ field.onChange }
                                    placeholder="A custom legal fee"
                                />
                            ) }
                        />
                    }
                    feedback={ errors.legalFee?.message }
                    colors={ props.colors }
                    help={
                        `If you leave the field empty, the default legal fee (2000 ${ Lgnt.CODE }) is charged on LOC opening.
    If you negotiated another rate with the selected Legal Officer, you may enter it here.`
                    }
                />
            </CollapsePane>

            <ButtonGroup>
                <Button disabled={ props.legalOfficer === undefined || !limits.areValid() } type="submit"
                        onClick={ handleSubmit(submit) }>Create Draft</Button>
            </ButtonGroup>

        </>
    )
}
