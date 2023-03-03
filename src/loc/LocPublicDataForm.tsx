import FormGroup from "../common/FormGroup";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { BackgroundAndForegroundColors } from "../common/ColorTheme";
import Form from "react-bootstrap/Form";
import StaticLabelValue from "src/common/StaticLabelValue";

export interface FormValues {
    dataName: string;
    dataValue: string;
}

export interface Props {
    control: Control<FormValues>;
    errors: FieldErrors<FormValues>;
    colors: BackgroundAndForegroundColors;
    dataName?: string;
}

export default function LocPublicDataForm(props: Props) {
    return (
        <>
            <h3>Add a public data</h3>
            <p>IMPORTANT: DO NOT SUBMIT CONFIDENTIAL OR PERSONAL INFORMATION (such as name, email, phone number, social
                security number, etc.) AS IT WILL IRREVOCABLY and PUBLICLY PUBLISHED ON THE LOGION BLOCKCHAIN.</p>
            {
                props.dataName !== undefined &&
                <StaticLabelValue
                    label="Public data Name (No confidential or personal information)"
                    value={ props.dataName }
                    formStyle={ true }
                />
            }
            {
                props.dataName === undefined &&
                <FormGroup
                    id="locDataName"
                    label="Public data name (No confidential or personal information)"
                    control={
                        <Controller
                            name="dataName"
                            control={ props.control }
                            defaultValue=""
                            rules={{
                                required: 'The public data Name is required',
                                minLength: {
                                    value: 3,
                                    message: 'The public data Name must contain at least 3 characters'
                                },
                                maxLength: {
                                    value: 40,
                                    message: 'The public data Name must contain at most 40 characters'
                                }
                            } }
                            render={ ({ field }) => (
                                <Form.Control
                                    isInvalid={ !!props.errors.dataName?.message }
                                    type="text" placeholder="e.g. XYZ"
                                    data-testid="dataName"
                                    aria-describedby="locDataName"
                                    { ...field }
                                />
                            ) }
                        />
                    }
                    colors={ props.colors }
                />
            }
            <FormGroup
                id="locDataValue"
                label="Public data (No confidential or personal information)"
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
                                value: 4096,
                                message: 'The Data must contain at most 4096 characters'
                            }
                        }}
                        render={({ field }) => (
                            <Form.Control
                                isInvalid={!!props.errors.dataValue?.message}
                                as="textarea"
                                placeholder="e.g. XYZ"
                                data-testid="dataValue"
                                aria-describedby="locDataValue"
                                style={{ height: '100px' }}
                                { ...field }
                            />
                        )}                    />

                }
                colors={ props.colors } />
        </>
    )
}
