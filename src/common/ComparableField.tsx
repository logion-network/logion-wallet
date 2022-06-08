import FormGroup from "./FormGroup";
import { Controller, useForm } from "react-hook-form";
import Form from "react-bootstrap/Form";
import { BackgroundAndForegroundColors } from "./ColorTheme";
import "./ComparableField.css";

export interface ComparableFieldProps<T> {
    id: string
    label: string
    data?: T
    otherData?: T
    field: (value: T) => string
    colors: BackgroundAndForegroundColors
    squeeze: boolean
    noComparison: boolean
}

export default function ComparableField<T>(props: ComparableFieldProps<T>) {

    const { control } = useForm<any>();

    function isInvalid(): boolean {
        if(props.noComparison) {
            return false;
        } else {
            if (props.data !== undefined && props.otherData !== undefined) {
                const value = props.field(props.data);
                const otherValue = props.field(props.otherData);
                return value !== otherValue;
            } else {
                return true;
            }
        }
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
                        defaultValue={ props.data ? props.field(props.data) : "" }
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
                noFeedback={ props.squeeze }
                colors={ props.colors }
            />
        </div>)
}
