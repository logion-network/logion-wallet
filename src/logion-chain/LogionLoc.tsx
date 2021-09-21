import { ApiPromise } from '@polkadot/api';
import { ExtrinsicSubmissionParameters, signAndSend, Unsubscriber } from './Signature';
import { UUID } from './UUID';

export interface LocCreationParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise,
    locId: UUID,
}

export function createLoc(parameters: LocCreationParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        locId,
    } = parameters;

    return signAndSend({
        signerId,
        submittable: api.tx.logionLoc.createLoc(locId.toHexString()),
        callback,
        errorCallback,
    });
}
