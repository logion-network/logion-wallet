import { ApiPromise } from "@polkadot/api";
import { SignAndSubmit } from "../ExtrinsicSubmitter";
import { LGNT_SMALLEST_UNIT } from "../logion-chain/Balances";
import { PrefixedNumber } from "../logion-chain/numbers";
import { getRecoveryConfig, signAndSendAsRecovered } from "../logion-chain/Recovery";
import { cancelVaultTransfer, buildCancelVaultTransferCall } from "../logion-chain/Vault";
import { VaultApi, VaultTransferRequest } from "../vault/VaultApi";
import { AxiosFactory } from "./api";
import React from "react";

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
            return cancelVaultTransfer({
                api,
                callback: setResult,
                errorCallback: setError,
                signerId: signerId,
                destination: requestToCancel.destination,
                amount,
                block: BigInt(requestToCancel.block),
                index: requestToCancel.index,
                recoveryConfig: recoveryConfig!,
            });
        } else {
            const call = buildCancelVaultTransferCall({
                api,
                block: BigInt(requestToCancel.block),
                index: requestToCancel.index,
                recoveryConfig: recoveryConfig!,
                destination: requestToCancel.destination,
                amount,
            })
            return signAndSendAsRecovered({
                api: api!,
                signerId,
                callback: setResult,
                errorCallback: setError,
                recoveredAccountId: requestToCancel.origin,
                call
            })
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