import { ApiPromise } from "@polkadot/api";
import { SignAndSubmit } from "../ExtrinsicSubmitter";
import { LGNT_SMALLEST_UNIT } from "../logion-chain/Balances";
import { PrefixedNumber } from "../logion-chain/numbers";
import { getRecoveryConfig } from "../logion-chain/Recovery";
import { cancelVaultTransfer } from "../logion-chain/Vault";
import { VaultApi, VaultTransferRequest } from "../vault/VaultApi";
import { AxiosFactory } from "./api";

export async function cancelVaultTransferCallback(params: {
    signerId: string,
    api: ApiPromise,
    requestToCancel: VaultTransferRequest,
    setSignAndSubmit: React.Dispatch<React.SetStateAction<SignAndSubmit>>,
}) {
    const recoveryConfig = await getRecoveryConfig({
        api: params.api,
        accountId: params.signerId
    })
    const amount = new PrefixedNumber(params.requestToCancel.amount, LGNT_SMALLEST_UNIT);
    const signAndSubmit: SignAndSubmit = (setResult, setError) => cancelVaultTransfer({
        api: params.api,
        callback: setResult,
        errorCallback: setError,
        signerId: params.signerId,
        destination: params.requestToCancel.destination,
        amount,
        block: BigInt(params.requestToCancel.block),
        index: params.requestToCancel.index,
        recoveryConfig: recoveryConfig!,
    });
    params.setSignAndSubmit(() => signAndSubmit);
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
