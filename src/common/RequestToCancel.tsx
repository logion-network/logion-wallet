import ExtrinsicSubmitter, { SignAndSubmit } from "../ExtrinsicSubmitter";
import { VaultTransferRequest } from "../vault/VaultApi";
import Dialog from "./Dialog";

export interface Props {
    requestToCancel: VaultTransferRequest | null;
    setRequestToCancel: React.Dispatch<React.SetStateAction<VaultTransferRequest | null>>;
    signAndSubmit: SignAndSubmit;
    setSignAndSubmit: React.Dispatch<React.SetStateAction<SignAndSubmit>>;
    cancelFailed: boolean;
    setCancelFailed: React.Dispatch<React.SetStateAction<boolean>>;
    cancelRequestCallback: () => void;
    onCancelSuccessCallback: () => void;
}

export default function RequestToCancel(props: Props) {
    return (
        <Dialog
            show={ props.requestToCancel !== null }
            actions={[
                {
                    buttonText: "Cancel",
                    buttonVariant: "secondary-polkadot",
                    id: "cancel",
                    callback: () => { props.setRequestToCancel(null); props.setSignAndSubmit(null) },
                    disabled: props.signAndSubmit !== null && !props.cancelFailed
                },
                {
                    buttonText: "Proceed",
                    buttonVariant: "polkadot",
                    id: "proceed",
                    callback: props.cancelRequestCallback,
                    disabled: props.signAndSubmit !== null
                }
            ]}
            size="lg"
        >
            <h2>Cancel vault-out transfer</h2>

            <p>This will cancel the vault-out transfer. Your Legal Officer will be notified.</p>

            <ExtrinsicSubmitter
                id="cancel"
                signAndSubmit={ props.signAndSubmit }
                onSuccess={ props.onCancelSuccessCallback }
                onError={ () => props.setCancelFailed(true) }
            />
        </Dialog>
    );
}
