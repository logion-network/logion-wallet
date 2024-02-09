import { Controller, Control, FieldErrors } from 'react-hook-form';
import Form from "react-bootstrap/Form";
import { Lgnt } from "@logion/node-api";

import { BackgroundAndForegroundColors } from '../../common/ColorTheme';
import FormGroup from '../../common/FormGroup';
import Select from '../../common/Select';

import { buildOptions } from '../trust-protection/SelectLegalOfficer';
import { useUserContext } from "../UserContext";
import AmountControl, { Amount, validateAmount } from 'src/common/AmountControl';
import CollapsePane from 'src/components/collapsepane/CollapsePane';

export interface FormValues {
    description: string;
    legalOfficer: string;
    valueFee: Amount;
    collectionItemFee: Amount;
    tokensRecordFee: Amount;
    legalFee: Amount | undefined;
}

export interface Props {
    control: Control<FormValues>;
    errors: FieldErrors<FormValues>;
    colors: BackgroundAndForegroundColors;
    legalOfficer: string | null;
    showValueFee: boolean;
}

export default function LocCreationForm(props: Props) {
    const { locsState, workloads } = useUserContext();

    if(locsState === undefined) {
        return null;
    }

    return (
        <>
            <FormGroup
                id={ `locOwner` }
                label="Please select a Logion Legal Officer who already executed an Identity LOC linked to your Polkadot address:"
                control={
                    <Controller
                        name="legalOfficer"
                        control={ props.control }
                        defaultValue=""
                        rules={{
                            required: 'You must select a Legal Officer',
                            minLength: {
                                value: 1,
                                message: 'You must select a Legal Officer'
                            },

                        }}
                        render={({ field }) => (
                            <Select
                                isInvalid={ !!props.errors.legalOfficer?.message }
                                options={ buildOptions(locsState?.legalOfficersWithValidIdentityLoc, workloads) }
                                value={ field.value }
                                onChange={ field.onChange }
                            />
                        )}
                      />
                }
                feedback={ props.errors.legalOfficer?.message }
                colors={ props.colors }
            />

            <FormGroup
                id="locDescription"
                label="Description"
                control={
                    <Controller
                        name="description"
                        control={ props.control }
                        defaultValue=""
                        rules={{
                            required: 'The description is required',
                            minLength: {
                                value: 3,
                                message: 'The description must contain at least 3 characters'
                            },
                            maxLength: {
                                value: 40,
                                message: 'The description must contain at most 40 characters'
                            }
                        }}
                        render={({ field }) => (
                            <Form.Control
                                isInvalid={!!props.errors.description?.message}
                                type="text" placeholder="e.g. XYZ"
                                data-testid="description"
                                aria-describedby="locDescription"
                                { ...field }
                            />
                        )}
                      />
                }
                colors={ props.colors }
                feedback={ props.errors.description?.message }
            />

            {
                props.showValueFee &&
                <>
                <FormGroup
                    id="valueFee"
                    label="Value fee"
                    control={
                        <Controller
                            name="valueFee"
                            control={ props.control }
                            rules={{
                                validate: validateAmount
                            }}
                            render={ ({ field }) => (
                                <AmountControl
                                    isInvalid={ !!props.errors.valueFee?.message }
                                    value={ field.value }
                                    onChange={ field.onChange }
                                />
                            )}
                        />
                    }
                    feedback={ props.errors.valueFee?.message }
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
                            control={ props.control }
                            rules={{
                                validate: validateAmount
                            }}
                            render={ ({ field }) => (
                                <AmountControl
                                    isInvalid={ !!props.errors.collectionItemFee?.message }
                                    value={ field.value }
                                    onChange={ field.onChange }
                                />
                            )}
                        />
                    }
                    feedback={ props.errors.collectionItemFee?.message }
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
                            control={ props.control }
                            rules={{
                                validate: validateAmount
                            }}
                            render={ ({ field }) => (
                                <AmountControl
                                    isInvalid={ !!props.errors.tokensRecordFee?.message }
                                    value={ field.value }
                                    onChange={ field.onChange }
                                />
                            )}
                        />
                    }
                    feedback={ props.errors.tokensRecordFee?.message }
                    colors={ props.colors }
                    help={
                        `The tokens record fee is calculated in function of the value fee. It is charged to the requester on every tokens record creation.`
                    }
                />
                </>
            }

            <CollapsePane
                title="Advanced creation parameters"
            >
                <FormGroup
                    id="legalFee"
                    label="Legal fee"
                    control={
                        <Controller
                            name="legalFee"
                            control={ props.control }
                            rules={{
                                validate: validateAmount
                            }}
                            render={ ({ field }) => (
                                <AmountControl
                                    isInvalid={ !!props.errors.legalFee?.message }
                                    value={ field.value }
                                    onChange={ field.onChange }
                                    placeholder="A custom legal fee"
                                />
                            )}
                        />
                    }
                    feedback={ props.errors.legalFee?.message }
                    colors={ props.colors }
                    help={
                        `If you leave the field empty, the default legal fee (2000 ${ Lgnt.CODE }) is charged on LOC opening.
    If you negotiated another rate with the selected Legal Officer, you may enter it here.`
                    }
                />
            </CollapsePane>
        </>
    )
}
