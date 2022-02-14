import { ApiPromise } from '@polkadot/api';
import { stringToHex } from '@polkadot/util';
import { ExtrinsicSubmissionParameters, signAndSend, Unsubscriber } from './Signature';
import { UUID } from './UUID';
import { LegalOfficerCase, LocType, MetadataItem, VoidInfo, CollectionItem } from './Types';
import { LegalOfficerCaseOf, CollectionSize } from './interfaces';
import { Option } from "@polkadot/types-codec";

export interface LogionIdentityLocCreationParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise;
    locId: UUID;
}

export function createLogionIdentityLoc(parameters: LogionIdentityLocCreationParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        locId,
    } = parameters;

    return signAndSend({
        signerId,
        submittable: api.tx.logionLoc.createLogionIdentityLoc(locId.toHexString()),
        callback,
        errorCallback,
    });
}

export interface LogionTransactionLocCreationParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise;
    locId: UUID;
    requesterLocId: UUID;
}

export function createLogionTransactionLoc(parameters: LogionTransactionLocCreationParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        locId,
        requesterLocId,
    } = parameters;

    return signAndSend({
        signerId,
        submittable: api.tx.logionLoc.createLogionTransactionLoc(locId.toHexString(), requesterLocId.toHexString()),
        callback,
        errorCallback,
    });
}

export interface PolkadotIdentityLocCreationParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise;
    locId: UUID;
    requester: string;
}

export function createPolkadotIdentityLoc(parameters: PolkadotIdentityLocCreationParameters): Unsubscriber {
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
        submittable: api.tx.logionLoc.createPolkadotIdentityLoc(locId.toHexString(), requester),
        callback,
        errorCallback,
    });
}

export interface PolkadotTransactionLocCreationParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise;
    locId: UUID;
    requester: string;
}

export function createPolkadotTransactionLoc(parameters: PolkadotTransactionLocCreationParameters): Unsubscriber {
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
        submittable: api.tx.logionLoc.createPolkadotTransactionLoc(locId.toHexString(), requester),
        callback,
        errorCallback,
    });
}

export interface CollectionLocCreationParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise;
    locId: UUID;
    requester: string;
    lastBlock?: string;
    maxSize?: string;
}

export function createCollectionLoc(parameters: CollectionLocCreationParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        locId,
        requester,
        lastBlock,
        maxSize
    } = parameters;

    return signAndSend({
        signerId,
        submittable: api.tx.logionLoc.createCollectionLoc(locId.toHexString(), requester, lastBlock || null, maxSize || null),
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
            value: stringToHex(item.value),
            submitter: item.submitter,
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
        return toModel(result.unwrap());
    } else {
        return undefined;
    }
}

function toModel(rawLoc: LegalOfficerCaseOf): LegalOfficerCase {
    return {
        owner: rawLoc.owner.toString(),
        requesterAddress: rawLoc.requester.isAccount ? rawLoc.requester.asAccount.toString() : undefined,
        requesterLocId: rawLoc.requester.isLoc ? UUID.fromDecimalString(rawLoc.requester.asLoc.toString()) : undefined,
        metadata: rawLoc.metadata.toArray().map(rawItem => ({
            name: rawItem.name.toUtf8(),
            value: rawItem.value.toUtf8(),
            submitter: rawItem.submitter.toString(),
        })),
        files: rawLoc.files.toArray().map(rawFile => ({
            hash: rawFile.get('hash')!.toHex(),
            nature: rawFile.nature.toUtf8(),
            submitter: rawFile.submitter.toString(),
        })),
        links: rawLoc.links.toArray().map(rawLink => ({
            id: UUID.fromDecimalString(rawLink.id.toString())!,
            nature: rawLink.nature.toUtf8()
        })),
        closed: rawLoc.closed.isTrue,
        locType: rawLoc.loc_type.toString() as LocType,
        voidInfo: rawLoc.void_info.isSome ? {
            replacer: rawLoc.void_info.unwrap().replacer.isSome ? UUID.fromDecimalString(rawLoc.void_info.unwrap().replacer.toString()) : undefined
        } : undefined,
        replacerOf: rawLoc.replacer_of.isSome ? UUID.fromDecimalString(rawLoc.replacer_of.toString()) : undefined,
        collectionLastBlockSubmission: rawLoc.collection_last_block_submission.isSome ? rawLoc.collection_last_block_submission.unwrap().toBigInt() : undefined,
        collectionMaxSize: rawLoc.collection_max_size.isSome ? rawLoc.collection_max_size.unwrap().toNumber() : undefined,
    };
}

export interface GetLegalOfficerCasesParameters {
    api: ApiPromise;
    locIds: UUID[];
}

export async function getLegalOfficerCases(
    parameters: GetLegalOfficerCasesParameters
): Promise<(LegalOfficerCase | undefined)[]> {
    const {
        api,
        locIds,
    } = parameters;

    const result = await Promise.all(locIds.map(id => api.query.logionLoc.locMap(id.toHexString())));
    const locs: (LegalOfficerCase | undefined)[] = [];
    for(let i = 0; i < result.length; ++i) {
        const option = result[i];
        if(option.isSome) {
            locs.push(toModel(option.unwrap()));
        } else {
            locs.push(undefined);
        }
    }
    return locs;
}

export async function getLegalOfficerCasesMap(
    parameters: GetLegalOfficerCasesParameters
): Promise<Record<string, LegalOfficerCase>> {
    const locs = await getLegalOfficerCases(parameters);
    const map: Record<string, LegalOfficerCase> = {};
    for(let i = 0; i < locs.length; ++i) {
        const loc = locs[i];
        const locId = parameters.locIds[i];
        if(loc !== undefined) {
            map[locId.toDecimalString()] = loc;
        }
    }
    return map;
}

export interface AddFileParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise;
    locId: UUID;
    hash: string;
    nature: string;
    submitter: string;
}

export function addFile(parameters: AddFileParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        locId,
        hash,
        nature,
        submitter,
    } = parameters;

    return signAndSend({
        signerId,
        submittable: api.tx.logionLoc.addFile(locId.toHexString(), {
            hash,
            nature: stringToHex(nature),
            submitter
        }),
        callback,
        errorCallback,
    });
}

export interface CloseLocParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise;
    locId: UUID;
}

export function closeLoc(parameters: CloseLocParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        locId,
    } = parameters;

    return signAndSend({
        signerId,
        submittable: api.tx.logionLoc.close(locId.toHexString()),
        callback,
        errorCallback,
    });
}

export interface AddLinkParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise;
    locId: UUID;
    target: UUID;
    nature: string;
}

export function addLink(parameters: AddLinkParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        locId,
        target,
        nature,
    } = parameters;

    return signAndSend({
        signerId,
        submittable: api.tx.logionLoc.addLink(locId.toHexString(), {
            id: target.toHexString(),
            nature: stringToHex(nature)
        }),
        callback,
        errorCallback,
    });
}

export interface VoidLocParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise;
    locId: UUID;
    voidInfo: VoidInfo;
}

export function voidLoc(parameters: VoidLocParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        locId,
        voidInfo,
    } = parameters;

    if(voidInfo.replacer === undefined) {
        return signAndSend({
            signerId,
            submittable: api.tx.logionLoc.makeVoid(locId.toHexString()),
            callback,
            errorCallback,
        });
    } else {
        return signAndSend({
            signerId,
            submittable: api.tx.logionLoc.makeVoidAndReplace(locId.toHexString(), voidInfo.replacer.toHexString()),
            callback,
            errorCallback,
        });
    }
}

export interface GetCollectionItemParameters {
    api: ApiPromise;
    locId: UUID;
    itemId: string;
}

export async function getCollectionItem(
    parameters: GetCollectionItemParameters
): Promise<CollectionItem | undefined> {
    const {
        api,
        locId,
        itemId
    } = parameters;

    const result = await api.query.logionLoc.collectionItemsMap(locId.toHexString(), itemId);
    if (result.isSome) {
        const description = result.unwrap().description.toUtf8();
        return { id: itemId, description }
    } else {
        return undefined;
    }
}

export interface GetCollectionSizeParameters {
    api: ApiPromise;
    locId: UUID;
}

export async function getCollectionSize(
    parameters: GetCollectionSizeParameters
): Promise<number | undefined> {
    const {
        api,
        locId
    } = parameters;

    const result: Option<CollectionSize> = await api.query.logionLoc.collectionSizeMap(locId.toHexString());
    if (result.isSome) {
        return result.unwrap().toNumber();
    } else {
        return undefined;
    }
}
