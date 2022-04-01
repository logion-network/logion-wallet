import React from "react";
import { ApiPromise } from "@polkadot/api";
import { LGNT_SMALLEST_UNIT } from "logion-api/dist/Balances";
import { PrefixedNumber } from "logion-api/dist/numbers";
import { getRecoveryConfig, asRecovered } from "logion-api/dist/Recovery";
import { cancelVaultTransfer, buildCancelVaultTransferCall } from "logion-api/dist/Vault";

import { SignAndSubmit } from "../ExtrinsicSubmitter";
import { VaultApi, VaultTransferRequest } from "../vault/VaultApi";
import { AxiosFactory } from "./api";
import { signAndSend } from "src/logion-chain/Signature";

export async function cancelVaultTransferCallback(params: {
    signerId: string,
    api: ApiPromise,
    requestToCancel: VaultTransferRequest,
    setSignAndSubmit: React.Dispatch<React.SetStateAction<SignAndSubmit>>,
}) {
    const { requestToCancel, signerId, api, setSignAndSubmit } = params
    const recoveryConfig = await getRecoveryConfig({
        api,
        accountId: signerId
    })
    const amount = new PrefixedNumber(requestToCancel.amount, LGNT_SMALLEST_UNIT);
    const signAndSubmit: SignAndSubmit = (setResult, setError) => {
        if (requestToCancel.origin === signerId) {
            return signAndSend({
                submittable: cancelVaultTransfer({
                    api,
                    destination: requestToCancel.destination,
                    amount,
                    block: BigInt(requestToCancel.block),
                    index: requestToCancel.index,
                    recoveryConfig: recoveryConfig!,
                }),
                callback: setResult,
                errorCallback: setError,
                signerId
            });
        } else {
            const call = buildCancelVaultTransferCall({
                api,
                block: BigInt(requestToCancel.block),
                index: requestToCancel.index,
                recoveryConfig: recoveryConfig!,
                destination: requestToCancel.destination,
                amount,
            });
            return signAndSend({
                submittable: asRecovered({
                    api: api!,
                    recoveredAccountId: requestToCancel.origin,
                    call
                }),
                callback: setResult,
                errorCallback: setError,
                signerId
            });
        }
    }
    setSignAndSubmit(() => signAndSubmit);
}

export async function onCancelVaultTransferSuccessCallback(params: {
    axiosFactory: AxiosFactory,
    requestToCancel: VaultTransferRequest,
    setRequestToCancel: React.Dispatch<React.SetStateAction<VaultTransferRequest | null>>,
    setSignAndSubmit: React.Dispatch<React.SetStateAction<SignAndSubmit>>,
    refresh: () => void,
}) {
    const legalOfficer = params.requestToCancel!.legalOfficerAddress;
    const api = new VaultApi(params.axiosFactory!(legalOfficer), legalOfficer);
    await api.cancelVaultTransferRequest(params.requestToCancel!.id);
    params.setRequestToCancel(null);
    params.refresh!();
}
