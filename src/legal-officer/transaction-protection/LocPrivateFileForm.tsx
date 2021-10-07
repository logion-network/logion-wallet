import React from "react";
import FileSelectorButton from "../../common/FileSelectorButton";
import FormGroup from "../../common/FormGroup";
import { Controller, Control, FieldErrors } from "react-hook-form";
import Form from "react-bootstrap/Form";
import { BackgroundAndForegroundColors } from "../../common/ColorTheme";

export interface FormValues {
    fileName: string
}

export interface Props {
    control: Control<FormValues>;
    errors: FieldErrors<FormValues>;
    colors: BackgroundAndForegroundColors;
    onFileSelected: (file: File) => void;
}

export default function LocPrivateFileForm(props: Props) {

    return (
        <>
            <h3>Add a confidential document</h3>
            <p>Important: after publication, the only data that will be publicly available on the blockchain will be the
                HASH of the document</p>
            <FormGroup
                id="locFileName"
                label="Document Name"
                control={
                    <Controller
                        name="fileName"
                        control={ props.control }
                        defaultValue=""
                        render={ ({ field }) => (
                            <Form.Control
                                isInvalid={ !!props.errors.fileName?.message }
                                type="text" placeholder="e.g. XYZ"
                                data-testid="locFileName"
                                aria-describedby="locFileName"
                                { ...field }
                            />
                        ) } />

                }
                colors={ props.colors } />
            <FormGroup
                id="locFile"
                label="File"
                control={ <FileSelectorButton onFileSelected={ props.onFileSelected } /> }
                colors={ props.colors } />
        </>
    )
}
