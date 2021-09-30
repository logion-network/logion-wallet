import { ApiPromise } from '@polkadot/api';
import { stringToHex } from '@polkadot/util';
import { ExtrinsicSubmissionParameters, signAndSend, Unsubscriber } from './Signature';
import { UUID } from './UUID';
import { LegalOfficerCase, MetadataItem } from './Types';

export interface LocCreationParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise;
    locId: UUID;
    requester: string;
}

export function createLoc(parameters: LocCreationParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        locId,
        requester,
    } = parameters;

    return signAndSend({
        signerId,
        submittable: api.tx.logionLoc.createLoc(locId.toHexString(), requester),
        callback,
        errorCallback,
    });
}

export interface AddMetadataParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise;
    locId: UUID;
    item: MetadataItem;
}

export function addMetadata(parameters: AddMetadataParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        locId,
        item,
    } = parameters;

    return signAndSend({
        signerId,
        submittable: api.tx.logionLoc.addMetadata(locId.toHexString(), {
            name: stringToHex(item.name),
            value: stringToHex(item.value)
        }),
        callback,
        errorCallback,
    });
}

export interface GetLegalOfficerCaseParameters {
    api: ApiPromise;
    locId: UUID;
}

export async function getLegalOfficerCase(
    parameters: GetLegalOfficerCaseParameters
): Promise<LegalOfficerCase | undefined> {
    const {
        api,
        locId,
    } = parameters;

    const result = await api.query.logionLoc.locMap(locId.toHexString());
    if(result.isSome) {
        const rawLoc = result.unwrap();
        return {
            owner: rawLoc.owner.toString(),
            requester: rawLoc.requester.toString(),
            metadata: rawLoc.metadata.toArray().map(rawItem => ({
                name: rawItem.name.toUtf8(),
                value: rawItem.value.toUtf8(),
            })),
            hashes: rawLoc.hashes.toArray().map(rawHash => rawHash.toHexString())
        };
    } else {
        return undefined;
    }
}

export interface AddHashParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise;
    locId: UUID;
    hash: string;
}

export function addHash(parameters: AddHashParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        locId,
        hash,
    } = parameters;

    return signAndSend({
        signerId,
        submittable: api.tx.logionLoc.addHash(locId.toHexString(), hash),
        callback,
        errorCallback,
    });
}
