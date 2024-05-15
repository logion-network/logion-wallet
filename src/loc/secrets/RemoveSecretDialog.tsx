import { Secret } from "@logion/client";
import Dialog from "../../common/Dialog";
import { useForm } from "react-hook-form";
import { useCallback } from "react";
import Icon from "../../common/Icon";
import ViewableSecret from "./ViewableSecret";
import "./RemoveSecretDialog.css"

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
            className="RemoveSecretDialog"
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
            <Icon icon={{id: "big-warning"}} type="png" height="70px"/>
            <p>You are about to remove the secret <strong>{ props.secret?.name }</strong>:</p>
            <p>It will be impossible to recover it after, so make your <strong>own backup</strong> of the value:</p>
            <ViewableSecret value={ props.secret?.value || ""}/>
        </Dialog>
    )
}
