import FormGroup from "../../common/FormGroup";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { BackgroundAndForegroundColors } from "../../common/ColorTheme";
import Form from "react-bootstrap/Form";
import React from "react";

export interface FormValues {
    dataName: string;
    dataValue: string;
}

export interface Props {
    control: Control<FormValues>;
    errors: FieldErrors<FormValues>;
    colors: BackgroundAndForegroundColors;
}

export default function LocPublicDataForm(props: Props) {
    return (
        <>
            <h3>Add a public data</h3>
            <p>Important: after publication, these data will be publicly available on the blockchain.</p>
            <FormGroup
                id="locDataName"
                label="Data Name"
                control={
                    <Controller
                        name="dataName"
                        control={ props.control }
                        defaultValue=""
                        rules={{
                            required: 'The Data Name is required',
                            minLength: {
                                value: 3,
                                message: 'The Data Name must contain at least 3 characters'
                            },
                            maxLength: {
                                value: 40,
                                message: 'The Data Name must contain at most 40 characters'
                            }
                        }}
                        render={({ field }) => (
                            <Form.Control
                                isInvalid={!!props.errors.dataName?.message}
                                type="text" placeholder="e.g. XYZ"
                                data-testid="dataName"
                                aria-describedby="locDataName"
                                { ...field }
                            />
                        )}                    />

                }
                colors={ props.colors } />
            <FormGroup
                id="locDataValue"
                label="Data"
                control={
                    <Controller
                        name="dataValue"
                        control={ props.control }
                        defaultValue=""
                        rules={{
                            required: 'The Data is required',
                            minLength: {
                                value: 1,
                                message: 'The Data must contain at least 1 character'
                            },
                            maxLength: {
                                value: 40,
                                message: 'The Data Name must contain at most 40 characters'
                            }
                        }}
                        render={({ field }) => (
                            <Form.Control
                                isInvalid={!!props.errors.dataValue?.message}
                                type="text" placeholder="e.g. XYZ"
                                data-testid="dataValue"
                                aria-describedby="locDataValue"
                                { ...field }
                            />
                        )}                    />

                }
                colors={ props.colors } />
        </>
    )
}
