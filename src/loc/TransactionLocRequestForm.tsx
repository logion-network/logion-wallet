import { Controller, Control, FieldErrors } from 'react-hook-form';
import Form from "react-bootstrap/Form";
import { Lgnt } from "@logion/node-api";

import { BackgroundAndForegroundColors } from '../common/ColorTheme';
import FormGroup from '../common/FormGroup';
import Select, { OptionType } from '../common/Select';

import { buildOptions } from '../wallet-user/trust-protection/SelectLegalOfficer';
import { useUserContext } from "../wallet-user/UserContext";
import AmountControl, { Amount, validateAmount } from '../common/AmountControl';
import CollapsePane from '../components/collapsepane/CollapsePane';
import { useState, useEffect } from "react";

export interface FormValues {
    description: string;
    legalOfficer: string;
    legalFee: Amount | undefined;
}

export interface Props {
    control: Control<FormValues>;
    errors: FieldErrors<FormValues>;
    colors: BackgroundAndForegroundColors;
    legalOfficer: string | null;
}

export default function TransactionLocRequestForm(props: Props) {
    const { locsState } = useUserContext();
    const [ legalOfficersOptions, setLegalOfficersOptions ] = useState<OptionType<string>[]>([]);

    useEffect(() => {
        if (locsState !== undefined && legalOfficersOptions.length === 0) {
            buildOptions(locsState.legalOfficersWithValidIdentityLoc)
                .then(options => setLegalOfficersOptions(options));
        }
    }, [ legalOfficersOptions, locsState ]);

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
                                options={ legalOfficersOptions }
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
