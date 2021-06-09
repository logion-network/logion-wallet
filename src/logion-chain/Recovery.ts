import { ApiPromise } from '@polkadot/api';
import { Option } from '@polkadot/types';
import { RecoveryConfig as PolkadotRecoveryConfig } from '@polkadot/types/interfaces/recovery';

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
