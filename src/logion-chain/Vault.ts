import { keyring } from "@polkadot/ui-keyring";
import { ApiPromise } from "@polkadot/api";
import { HexString } from "@polkadot/util/types";
import { Weight } from '@polkadot/types/interfaces/runtime';

import { ExtrinsicSubmissionParameters, signAndSend, Unsubscriber } from "./Signature";
import { getRecoveryConfig, RecoveryConfig } from "./Recovery";
import { PrefixedNumber } from "./numbers";
import { LGNT_SMALLEST_UNIT } from './Balances';

const THRESHOLD = 2;

export function getVaultAddress(requesterAddress: string, recoveryConfig: RecoveryConfig): string {
    checkKeyringLoaded()
    const signatories: string[] = [ requesterAddress, ...recoveryConfig.friends.map(accountId => accountId.toString()) ].sort()
    const result = keyring.addMultisig(signatories, THRESHOLD);
    const vaultAddress = result.pair.address;
    console.log("Vault address is %s for signatories: %s", vaultAddress, signatories)
    return vaultAddress
}

function checkKeyringLoaded() {
    isKeyringLoaded() || keyring.loadAll({})
}

function isKeyringLoaded () {
    try {
        return !!keyring.keyring;
    } catch {
        return false;
    }
}

export interface RequestVaultTransferParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise;
    recoveryConfig: RecoveryConfig;
    amount: PrefixedNumber;
    destination: string;
}

export async function requestVaultTransfer(parameters: RequestVaultTransferParameters): Promise<{ unsubscriber: Unsubscriber }> {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        recoveryConfig,
        destination,
        amount,
    } = parameters;

    const actualAmount = amount.convertTo(LGNT_SMALLEST_UNIT).coefficient.unnormalize();
    const { call, weight } = await transferCallAndWeight(api, signerId, recoveryConfig, BigInt(actualAmount), destination);

    const legalOfficers = recoveryConfig.friends.toArray().map(accountId => accountId.toString());
    const sortedLegalOfficers = [ ...legalOfficers ].sort();
    const unsubscriber = signAndSend({
        signerId,
        submittable: api.tx.vault.requestCall(sortedLegalOfficers, call, weight),
        callback,
        errorCallback,
    });
    return { unsubscriber };
}

async function transferCallAndWeight(
    api: ApiPromise,
    requesterAddress: string,
    recoveryConfig: RecoveryConfig,
    amount: bigint,
    destination: string,
): Promise<{ call: HexString, weight: Weight }> {
    const multisigOrigin = getVaultAddress(requesterAddress, recoveryConfig);
    const call = api.tx.balances.transfer(destination, amount);
    const dispatchInfo = await call.paymentInfo(multisigOrigin);
    const maxWeight = dispatchInfo.weight; 
    return {
        call: call.toHex(),
        weight: maxWeight
    }
}

export interface VaultTransferApprovalParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise,
    requester: string,
    amount: bigint;
    destination: string;
    block: bigint,
    index: number
}

export async function approveVaultTransfer(parameters: VaultTransferApprovalParameters): Promise<Unsubscriber> {
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
    const legalOfficers = recoveryConfig.unwrap().friends.toArray().map(accountId => accountId.toString());
    const otherLegalOfficer = legalOfficers.find(accountId => accountId !== signerId)!;

    const { call, weight } = await transferCallAndWeight(api, requester, recoveryConfig.unwrap(), amount, destination);

    const otherSignatories = [ requester, otherLegalOfficer ].sort();
    return signAndSend({
        signerId,
        submittable: api.tx.vault.approveCall(otherSignatories, call, {height: block, index}, weight),
        callback,
        errorCallback,
    });
}
