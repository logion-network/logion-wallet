import { Secret } from "@logion/client";
import Dialog from "../../common/Dialog";
import { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import FormGroup from "../../common/FormGroup";
import { Form } from "react-bootstrap";
import { useCommonContext } from "../../common/CommonContext";

export interface Props {
    show: boolean;
    onAddSecret: (secret: Secret) => void;
    onCancel: () => void;
}

export default function AddSecretDialog(props: Props) {

    const { colorTheme } = useCommonContext();
    const { handleSubmit, control, formState: { errors }, reset } = useForm<Secret>();

    const cancel = useCallback(() => {
        props.onCancel();
        reset();
    }, [ props, reset ])

    const submit = useCallback((secret: Secret) => {
        props.onAddSecret(secret);
        reset();
    }, [ props, reset ])

    return (
        <Dialog
            show={ props.show }
            size="lg"
            actions={ [
                {
                    id: "cancel",
                    buttonText: "Cancel",
                    buttonVariant: "secondary",
                    callback: cancel,
                },
                {
                    id: "save",
                    buttonText: "Save",
                    buttonVariant: "primary",
                    type: "submit",
                }
            ] }
            onSubmit={ handleSubmit(submit) }
        >
            <h3>Add a Recoverable Secret</h3>
            <FormGroup
                id="name"
                label="Name"
                control={
                    <Controller
                        name="name"
                        control={ control }
                        defaultValue=""
                        rules={ { maxLength: 255, required: true } }
                        render={ ({ field }) => (
                            <Form.Control
                                isInvalid={ !!errors.name?.message }
                                type="text" placeholder="e.g. XYZ"
                                data-testid="name"
                                aria-describedby="name"
                                { ...field }
                            />
                        ) } />

                }
                colors={ colorTheme.dialog }
            />
            <FormGroup
                id="value"
                label="Value"
                control={
                    <Controller
                        name="value"
                        control={ control }
                        defaultValue=""
                        rules={ { maxLength: 4096, required: true } }
                        render={ ({ field }) => (
                            <Form.Control
                                as="textarea"
                                rows={ 3 }
                                isInvalid={ !!errors.value?.message }
                                type="text" placeholder="e.g. XYZ"
                                data-testid="value"
                                aria-describedby="value"
                                { ...field }
                            />
                        ) } />

                }
                colors={ colorTheme.dialog }
            />
        </Dialog>
    )
}
