import React from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import Form from "react-bootstrap/Form";

import { BackgroundAndForegroundColors } from '../../common/ColorTheme';
import FormGroup from '../../common/FormGroup';

export interface FormValues {
    description: string;
}

export interface Props {
    control: Control<FormValues>,
    errors: FieldErrors<FormValues>,
    colors: BackgroundAndForegroundColors,
}

export default function LocCreationForm(props: Props) {

    return (
        <>
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
                        render={({ field }) => <Form.Control isInvalid={!!props.errors.description?.message} type="text" placeholder="e.g. XYZ" data-testid="description" {...field} />}
                      />
                }
                colors={ props.colors }
                feedback={ props.errors.description?.message }
            />
        </>
    )
}
