import { ApiPromise } from '@polkadot/api';
import { Call } from '@polkadot/types/interfaces';

import { ExtrinsicSubmissionParameters, signAndSend, Unsubscriber } from './Signature';
import { SubmittableExtrinsic } from "@polkadot/api/promise/types";

export interface RecoveryCreationParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise,
    legalOfficers: string[]
}

export function createRecovery(parameters: RecoveryCreationParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        legalOfficers,
    } = parameters;

    const sortedLegalOfficers = [ ...legalOfficers ].sort();
    return signAndSend({
        signerId,
        submittable: api.tx.verifiedRecovery.createRecovery(sortedLegalOfficers),
        callback,
        errorCallback,
    });
}

export interface GetRecoveryConfigParameters {
    api: ApiPromise,
    accountId: string,
}

export async function getRecoveryConfig(parameters: GetRecoveryConfigParameters): Promise<RecoveryConfig | undefined> {
    const {
        api,
        accountId,
    } = parameters;

    const recoveryConfig = await api.query.recovery.recoverable(accountId);
    if (recoveryConfig.isEmpty) {
        return undefined
    }
    return { legalOfficers: recoveryConfig.unwrap().friends.toArray().map(accountId => accountId.toString())};
}

export type RecoveryConfig = {
    legalOfficers: string[]
}

export interface GetActiveRecoveryParameters {
    api: ApiPromise,
    sourceAccount: string,
    destinationAccount: string,
}

export async function getActiveRecovery(parameters: GetActiveRecoveryParameters): Promise<ActiveRecovery | undefined> {
    const {
        api,
        sourceAccount,
        destinationAccount,
    } = parameters;

    const activeRecovery = await api.query.recovery.activeRecoveries(sourceAccount, destinationAccount);
    if (activeRecovery.isEmpty) {
        return undefined
    }
    return { legalOfficers: activeRecovery.unwrap().friends.toArray().map(accountId => accountId.toString())};
}

export type ActiveRecovery = {
    legalOfficers: string[]
}

export interface InitiateRecoveryParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise,
    addressToRecover: string,
}

export function initiateRecovery(parameters: InitiateRecoveryParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        addressToRecover,
    } = parameters;

    return signAndSend({
        signerId,
        submittable: api.tx.recovery.initiateRecovery(addressToRecover),
        callback,
        errorCallback,
    });
}

export interface VouchRecoveryParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise,
    lost: string,
    rescuer: string,
}

export function vouchRecovery(parameters: VouchRecoveryParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        lost,
        rescuer,
    } = parameters;

    return signAndSend({
        signerId,
        submittable: api.tx.recovery.vouchRecovery(lost, rescuer),
        callback,
        errorCallback,
    });
}

export interface GetProxyParameters {
    api: ApiPromise,
    currentAddress: string,
}

export async function getProxy(parameters: GetProxyParameters): Promise<string | undefined> {
    const {
        api,
        currentAddress,
    } = parameters;

    const proxy = await api.query.recovery.proxy(currentAddress);
    if (proxy.isEmpty) {
        return undefined
    }
    return proxy.unwrap().toString();
}

export interface ClaimRecoveryParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise,
    addressToRecover: string,
}

export function claimRecovery(parameters: ClaimRecoveryParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        addressToRecover,
    } = parameters;

    return signAndSend({
        signerId,
        submittable: api.tx.recovery.claimRecovery(addressToRecover),
        callback,
        errorCallback,
    });
}

export interface BuildAsRecoveredCallParameters {
    api: ApiPromise,
    recoveredAccountId: string,
    call: Call,
}

export interface SignAndSendAsRecoveredParameters extends BuildAsRecoveredCallParameters, ExtrinsicSubmissionParameters {
}

export function signAndSendAsRecovered(parameters: SignAndSendAsRecoveredParameters): Unsubscriber {
    const {
        signerId,
        callback,
        errorCallback,
    } = parameters;

    return signAndSend({
        signerId,
        submittable: buildAsRecoveredSubmittable(parameters),
        callback,
        errorCallback,
    });
}

export function buildAsRecoveredCall(parameters: BuildAsRecoveredCallParameters): Call {
    return parameters.api.createType('Call', buildAsRecoveredSubmittable(parameters))
}

export function buildAsRecoveredSubmittable(parameters: BuildAsRecoveredCallParameters): SubmittableExtrinsic {
    const {
        api,
        recoveredAccountId,
        call,
    } = parameters;
    return api.tx.recovery.asRecovered(recoveredAccountId, call)
}
