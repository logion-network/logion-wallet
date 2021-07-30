import React from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import Form from "react-bootstrap/Form";

import { BackgroundAndForegroundColors } from '../common/ColorTheme';
import FormGroup from '../common/FormGroup';

export interface FormValues {
    requestedTokenName: string,
    bars: number,
}

export interface Props {
    control: Control<FormValues>,
    errors: FieldErrors<FormValues>,
    colors: BackgroundAndForegroundColors,
}

export default function TokenCreationForm(props: Props) {

    return (
        <>
            <FormGroup
                id="requestedTokenName"
                label="Token Name"
                control={
                    <Controller
                        name="requestedTokenName"
                        control={ props.control }
                        defaultValue=""
                        rules={{
                                required: 'The token name is required',
                                minLength: {
                                    value: 3,
                                    message: 'The token name must contain at least 3 characters'
                                },
                                maxLength: {
                                    value: 40,
                                    message: 'The token name must contain at most 40 characters'
                                }
                        }}
                        render={({ field }) => <Form.Control isInvalid={!!props.errors.requestedTokenName?.message} type="text" placeholder="e.g. XYZ" data-testid="tokenName" {...field} />}
                      />
                }
                colors={ props.colors }
                feedback={ props.errors.requestedTokenName?.message }
            />

            <FormGroup
                id="bars"
                label="Number of Gold Bars"
                control={ 
                    <Controller
                        name="bars"
                        control={ props.control }
                        rules={{
                            required: 'The # of bars is required',
                            min: {
                                value: 1,
                                message: 'The # of bars must be greater or equal to 1'
                            },
                            max: {
                                value: 100,
                                message: 'The # of bars must not be greater than 100'
                            }
                        }}
                        render={({ field }) => <Form.Control isInvalid={!!props.errors.bars?.message} type="number" placeholder="e.g. 3" data-testid="bars" {...field} />}
                    />
                }
                colors={ props.colors }
                feedback={ props.errors.bars?.message }
            />
        </>
    )
}
