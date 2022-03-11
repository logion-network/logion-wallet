import { ApiPromise } from '@polkadot/api';
import { Option } from '@polkadot/types';
import { AccountId, Call } from '@polkadot/types/interfaces';
import { ActiveRecovery as PolkadotActiveRecovery } from '@polkadot/types/interfaces/recovery';

import { ExtrinsicSubmissionParameters, signAndSend, Unsubscriber } from './Signature';

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

export async function getActiveRecovery(parameters: GetActiveRecoveryParameters): Promise<Option<PolkadotActiveRecovery>> {
    const {
        api,
        sourceAccount,
        destinationAccount,
    } = parameters;

    return await api.query.recovery.activeRecoveries(sourceAccount, destinationAccount);
}

export type ActiveRecovery = PolkadotActiveRecovery;

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

export async function getProxy(parameters: GetProxyParameters): Promise<Option<AccountId>> {
    const {
        api,
        currentAddress,
    } = parameters;

    return await api.query.recovery.proxy(currentAddress);
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

export interface SignAndSendAsRecoveredParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise,
    recoveredAccountId: string,
    call: Call,
}

export function signAndSendAsRecovered(parameters: SignAndSendAsRecoveredParameters): Unsubscriber {
    const {
        api,
        recoveredAccountId,
        signerId,
        callback,
        errorCallback,
        call,
    } = parameters;

    return signAndSend({
        signerId,
        submittable: api.tx.recovery.asRecovered(recoveredAccountId, call),
        callback,
        errorCallback,
    });
}
