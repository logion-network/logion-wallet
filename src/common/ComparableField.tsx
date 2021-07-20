import FormGroup from "./FormGroup";
import { Controller, useForm } from "react-hook-form";
import Form from "react-bootstrap/Form";
import React from "react";
import { BackgroundAndForegroundColors } from "./ColorTheme";
import "./ComparableField.css";

export interface ComparableFieldProps<T> {
    id: string
    label: string
    data: T
    otherData?: T
    field: (value: T) => string
    colors: BackgroundAndForegroundColors
}

export default function ComparableField<T>(props: ComparableFieldProps<T>) {

    const { control } = useForm<any>();

    function isInvalid(): boolean {
        const value = props.field(props.data);
        if (props.otherData !== undefined) {
            const otherValue = props.field(props.otherData);
            return value !== otherValue;
        }
        return false;
    }

    return (
        <div className="ComparableField">
            <FormGroup
                id={ props.id }
                label={ props.label }
                control={
                    <Controller
                        name={ props.id }
                        control={ control }
                        defaultValue={ props.field(props.data) }
                        render={ ({ field }) => (
                            <Form.Control
                                isInvalid={ isInvalid() }
                                readOnly
                                type="text"
                                data-testid={ props.id } { ...field }
                            />
                        ) }
                    />
                }
                noFeedback
                colors={ props.colors }
            />
        </div>)
}
