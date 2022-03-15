import { ApiPromise } from "@polkadot/api";
import { Weight } from '@polkadot/types/interfaces/runtime';
import { createKeyMulti, encodeAddress } from '@polkadot/util-crypto';

import { ExtrinsicSubmissionParameters, signAndSend, Unsubscriber } from "./Signature";
import { getRecoveryConfig, RecoveryConfig } from "./Recovery";
import { PrefixedNumber } from "./numbers";
import { LGNT_SMALLEST_UNIT } from './Balances';
import { SubmittableExtrinsic } from "@polkadot/api/promise/types";
import { Call } from "@polkadot/types/interfaces";

const THRESHOLD = 2;

export function getVaultAddress(requesterAddress: string, recoveryConfig: RecoveryConfig): string {
    const signatories: string[] = [ requesterAddress, ...recoveryConfig.legalOfficers ].sort()
    const vaultAddress = encodeAddress(createKeyMulti(signatories, THRESHOLD));
    return vaultAddress;
}

export interface BuildRequestVaultTransferParameters {
    api: ApiPromise;
    recoveryConfig: RecoveryConfig;
    amount: PrefixedNumber;
    destination: string;
}

export interface RequestVaultTransferParameters extends ExtrinsicSubmissionParameters, BuildRequestVaultTransferParameters {
}

export async function requestVaultTransfer(parameters: RequestVaultTransferParameters): Promise<{ unsubscriber: Unsubscriber }> {
    const {
        signerId,
        callback,
        errorCallback,
    } = parameters;

    try {
        const unsubscriber = signAndSend({
            signerId,
            submittable: await buildRequestCallSubmittable({ ...parameters, requesterAddress: signerId }),
            callback,
            errorCallback,
        });
        return { unsubscriber };
    } catch(error) {
        const message = (error instanceof Error) ? error.message : String(error)
        errorCallback(message)
        return { unsubscriber: Promise.resolve(() => {}) };
    }
}

async function buildRequestCallSubmittable(parameters: BuildRequestVaultTransferParameters & { requesterAddress: string }): Promise<SubmittableExtrinsic> {
    const {
        api,
        requesterAddress,
        recoveryConfig,
        destination,
        amount,
    } = parameters;

    const actualAmount = amount.convertTo(LGNT_SMALLEST_UNIT).coefficient.unnormalize();
    const { call, weight, multisigOrigin } = await transferCallAndWeight(api, requesterAddress, recoveryConfig, BigInt(actualAmount), destination);

    const existingMultisig = await api.query.multisig.multisigs(multisigOrigin, call.method.hash);
    if(existingMultisig.isSome) {
        throw new Error("A similar transfer has already been requested and is pending");
    }

    const sortedLegalOfficers = [ ...recoveryConfig.legalOfficers ].sort();
    return api.tx.vault.requestCall(sortedLegalOfficers, call.method.hash, weight)
}

export async function buildVaultTransferCall(parameters: BuildRequestVaultTransferParameters & { requesterAddress: string }): Promise<Call> {
    return parameters.api.createType('Call', await buildRequestCallSubmittable(parameters))
}

async function transferCallAndWeight(
    api: ApiPromise,
    requesterAddress: string,
    recoveryConfig: RecoveryConfig,
    amount: bigint,
    destination: string,
): Promise<{ call: SubmittableExtrinsic, weight: Weight, multisigOrigin: string }> {
    const multisigOrigin = getVaultAddress(requesterAddress, recoveryConfig);
    const call = transferCall(api, destination, amount);
    const dispatchInfo = await call.paymentInfo(multisigOrigin);
    const maxWeight = dispatchInfo.weight;
    return {
        call,
        weight: maxWeight,
        multisigOrigin
    }
}

function transferCall(
    api: ApiPromise,
    destination: string,
    amount: bigint,
): SubmittableExtrinsic {
    return api.tx.balances.transfer(destination, amount);
}

export interface VaultTransferApprovalParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise,
    requester: string,
    amount: PrefixedNumber;
    destination: string;
    block: bigint,
    index: number
}

export async function approveVaultTransfer(parameters: VaultTransferApprovalParameters): Promise<{ unsubscriber: Unsubscriber }> {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        requester,
        amount,
        destination,
        block,
        index,
    } = parameters;

    const recoveryConfig = await getRecoveryConfig({
        api,
        accountId: requester
    });
    const otherLegalOfficer = recoveryConfig!.legalOfficers.find(accountId => accountId !== signerId)!;

    const actualAmount = amount.convertTo(LGNT_SMALLEST_UNIT).coefficient.unnormalize();
    const { call, weight } = await transferCallAndWeight(api, requester, recoveryConfig!, BigInt(actualAmount), destination);

    const otherSignatories = [ requester, otherLegalOfficer ].sort();
    const unsubscriber = signAndSend({
        signerId,
        submittable: api.tx.vault.approveCall(otherSignatories, call.method.toHex(), {height: block, index}, weight),
        callback,
        errorCallback,
    });
    return { unsubscriber };
}

export interface CancelVaultTransferParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise;
    recoveryConfig: RecoveryConfig;
    amount: PrefixedNumber;
    destination: string;
    block: bigint,
    index: number
}

export function cancelVaultTransfer(parameters: CancelVaultTransferParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        recoveryConfig,
        destination,
        amount,
        block,
        index,
    } = parameters;

    const actualAmount = amount.convertTo(LGNT_SMALLEST_UNIT).coefficient.unnormalize();
    const call = transferCall(api, destination, BigInt(actualAmount));

    const sortedLegalOfficers = [ ...recoveryConfig.legalOfficers ].sort();
    return signAndSend({
        signerId,
        submittable: api.tx.multisig.cancelAsMulti(2, sortedLegalOfficers, {height: block, index}, call.method.hash),
        callback,
        errorCallback,
    });
}
