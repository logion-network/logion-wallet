import React, { useCallback } from "react";
import { VaultState, VaultTransferRequest } from "@logion/client";
import { ValidAccountId } from "@logion/node-api";

import Dialog from "./Dialog";
import ExtrinsicSubmissionStateView from "src/ExtrinsicSubmissionStateView";
import { CallCallback, useLogionChain } from "src/logion-chain";
import { useUserContext } from "src/wallet-user/UserContext";

export interface Props {
    requestToCancel: VaultTransferRequest | null;
    setRequestToCancel: React.Dispatch<React.SetStateAction<VaultTransferRequest | null>>;
}

export default function RequestToCancel(props: Props) {
    const { submitCall, client, signer, extrinsicSubmissionState, clearSubmissionState } = useLogionChain();
    const { mutateVaultState } = useUserContext();

    const close = useCallback(() => {
        props.setRequestToCancel(null);
    }, [ props ]);

    const cancelRequestCallback = useCallback(async () => {
        const call = async (callback: CallCallback) => {
            await mutateVaultState(async (vaultState: VaultState) => {
                if(client && props.requestToCancel !== null && signer) {
                    return vaultState.cancelVaultTransferRequest(
                        client.getLegalOfficer(ValidAccountId.polkadot(props.requestToCancel.legalOfficerAddress)),
                        props.requestToCancel,
                        signer,
                        callback
                    );
                } else {
                    throw new Error();
                }
            })
        };
        try {
            await submitCall(call);
            close();
        } finally {
            clearSubmissionState();
        }
    }, [ props.requestToCancel, mutateVaultState, signer, client, submitCall, close, clearSubmissionState ]);

    return (
        <Dialog
            show={ props.requestToCancel !== null }
            actions={[
                {
                    buttonText: "Cancel",
                    buttonVariant: "secondary-polkadot",
                    id: "cancel",
                    callback: close,
                    disabled: extrinsicSubmissionState.inProgress || extrinsicSubmissionState.isError()
                },
                {
                    buttonText: "Proceed",
                    buttonVariant: "polkadot",
                    id: "proceed",
                    callback: cancelRequestCallback,
                    disabled: !extrinsicSubmissionState.canSubmit(),
                }
            ]}
            size="lg"
        >
            <h2>Cancel vault withdrawal</h2>

            <p>This will cancel the vault withdrawal. Your Legal Officer will be notified.</p>

            <ExtrinsicSubmissionStateView />
        </Dialog>
    );
}
