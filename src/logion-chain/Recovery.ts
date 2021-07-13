import { ApiPromise } from '@polkadot/api';
import { Option } from '@polkadot/types';
import {
    RecoveryConfig as PolkadotRecoveryConfig,
    ActiveRecovery as PolkadotActiveRecovery
} from '@polkadot/types/interfaces/recovery';

import {
    ExtrinsicSubmissionParameters,
    signAndSend,
    Unsubscriber
} from './Signature';

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

    return signAndSend({
        signerId,
        submittable: api.tx.recovery.createRecovery(legalOfficers, 1, 0),
        callback,
        errorCallback,
    });
}

export interface GetRecoveryConfigParameters {
    api: ApiPromise,
    accountId: string,
}

export async function getRecoveryConfig(parameters: GetRecoveryConfigParameters): Promise<Option<PolkadotRecoveryConfig>> {
    const {
        api,
        accountId,
    } = parameters;

    return await api.query.recovery.recoverable(accountId);
}

export type RecoveryConfig = PolkadotRecoveryConfig;

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
