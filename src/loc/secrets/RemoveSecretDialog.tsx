import { Secret } from "@logion/client";
import Dialog from "../../common/Dialog";
import { useForm } from "react-hook-form";
import { useCallback } from "react";

export interface Props {
    secret: Secret | undefined;
    onRemoveSecret: (secret: Secret) => void;
    onCancel: () => void;
}

export default function RemoveSecretDialog(props: Props) {
    const { handleSubmit, reset } = useForm<{}>();

    const cancel = useCallback(() => {
        props.onCancel();
        reset();
    }, [ props, reset ])

    const submit = useCallback((_: {}) => {
        props.onRemoveSecret(props.secret!);
        reset();
    }, [ props, reset ])

    return (
        <Dialog
            show={ props.secret !== undefined }
            size="lg"
            actions={ [
                {
                    id: "cancel",
                    buttonText: "Cancel",
                    buttonVariant: "secondary",
                    callback: cancel,
                },
                {
                    id: "remove",
                    buttonText: "Remove",
                    buttonVariant: "primary",
                    type: "submit",
                }
            ] }
            onSubmit={ handleSubmit(submit) }
        >
            <p>You are about to remove the secret <strong>{ props.secret?.name }</strong>.</p>
            <p>It will be impossible to recover it after, so make your own backup</p>
        </Dialog>
    )
}
