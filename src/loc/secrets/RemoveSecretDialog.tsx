import { Secret } from "@logion/client";
import Dialog from "../../common/Dialog";
import Icon from "../../common/Icon";
import ViewableSecret from "./ViewableSecret";
import "./RemoveSecretDialog.css"

export interface Props {
    secret: Secret | undefined;
    onRemoveSecret: (secret: Secret) => void;
    onCancel: () => void;
}

export default function RemoveSecretDialog(props: Props) {
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
                    callback: props.onCancel,
                },
                {
                    id: "remove",
                    buttonText: "Remove",
                    buttonVariant: "primary",
                    callback: () => props.onRemoveSecret(props.secret!),
                }
            ] }
        >
            <Icon icon={{id: "big-warning"}} type="png" height="70px"/>
            <p>You are about to remove the secret <strong>{ props.secret?.name }</strong>:</p>
            <p>It will be impossible to recover it after, so make your <strong>own backup</strong> of the value:</p>
            <ViewableSecret value={ props.secret?.value || ""}/>
        </Dialog>
    )
}
