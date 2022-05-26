import React from "react";
import { VaultTransferRequest } from "@logion/client";

import Dialog from "./Dialog";
import ClientExtrinsicSubmitter, { Call } from "src/ClientExtrinsicSubmitter";

export interface Props {
    requestToCancel: VaultTransferRequest | null;
    setRequestToCancel: React.Dispatch<React.SetStateAction<VaultTransferRequest | null>>;
    call: Call | undefined;
    setCall: React.Dispatch<React.SetStateAction<Call | undefined>>;
    cancelFailed: boolean;
    setCancelFailed: React.Dispatch<React.SetStateAction<boolean>>;
    cancelRequestCallback: () => void;
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
                    callback: () => { props.setRequestToCancel(null); props.setCall(undefined) },
                    disabled: props.call !== null && !props.cancelFailed
                },
                {
                    buttonText: "Proceed",
                    buttonVariant: "polkadot",
                    id: "proceed",
                    callback: props.cancelRequestCallback,
                    disabled: props.call !== null
                }
            ]}
            size="lg"
        >
            <h2>Cancel vault-out transfer</h2>

            <p>This will cancel the vault-out transfer. Your Legal Officer will be notified.</p>

            <ClientExtrinsicSubmitter
                call={ props.call }
                onError={ () => props.setCancelFailed(true) }
            />
        </Dialog>
    );
}
