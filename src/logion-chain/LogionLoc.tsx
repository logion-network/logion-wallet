import { ApiPromise } from '@polkadot/api';
import { stringToHex } from '@polkadot/util';
import { ExtrinsicSubmissionParameters, sign, signAndSend, SignedTransaction, Unsubscriber } from './Signature';
import { UUID } from './UUID';
import { LegalOfficerCase, MetadataItem, LocType, VoidInfo } from './Types';
import moment from 'moment';

export interface LocCreationParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise;
    locId: UUID;
    requester: string;
    locType: LocType;
}

export function createLoc(parameters: LocCreationParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        locId,
        requester,
        locType,
    } = parameters;

    return signAndSend({
        signerId,
        submittable: api.tx.logionLoc.createLoc(locId.toHexString(), requester, locType),
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
            files: rawLoc.files.toArray().map(rawFile => ({
                hash: rawFile.get('hash')!.toHex(),
                nature: rawFile.nature.toUtf8()
            })),
            links: rawLoc.links.toArray().map(rawLink => ({
                id: UUID.fromDecimalString(rawLink.id.toString())!,
                nature: rawLink.nature.toUtf8()
            })),
            closed: rawLoc.closed.isTrue,
            locType: rawLoc.loc_type.isIdentity ? 'Identity' : 'Transaction',
        };
    } else {
        return undefined;
    }
}

export interface AddFileParameters extends ExtrinsicSubmissionParameters {
    api: ApiPromise;
    locId: UUID;
    hash: string;
    nature: string;
}

export function addFile(parameters: AddFileParameters): Unsubscriber {
    const {
        api,
        signerId,
        callback,
        errorCallback,
        locId,
        hash,
        nature
    } = parameters;

    return signAndSend({
        signerId,
        submittable: api.tx.logionLoc.addFile(locId.toHexString(), {
            hash,
            nature: stringToHex(nature)
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
        // api,
        signerId,
        callback,
        // errorCallback,
        locId,
        voidInfo,
    } = parameters;

    // TODO signAndSend

    return sign({
        attributes: [],
        resource: "",
        operation: "",
        signerId,
        signedOn: moment()
    })
    .then(() => {
        voidMap[locId.toString()] = voidInfo;

        const mockResult: unknown = {
            isInBlock: true,
            status: {
                type: "InBlock"
            }
        };
        const result = mockResult as SignedTransaction;
        callback(result);
        return Promise.resolve(() => {});
    });
}

const voidMap: Record<string, VoidInfo> = {};

export interface GetVoidInfoParameters {
    api: ApiPromise;
    locId: UUID;
}

export async function getVoidInfo(
    parameters: GetVoidInfoParameters
): Promise<VoidInfo | null> {
    const {
        // api,
        locId,
    } = parameters;
    const key = locId.toString();
    if(key in voidMap) {
        return Promise.resolve(voidMap[key]);
    } else {
        return Promise.resolve(null);
    }
}

export interface GetVoidInfosParameters {
    api: ApiPromise;
    locIds: UUID[];
}

export async function getVoidInfos(
    parameters: GetVoidInfosParameters
): Promise<Record<string, VoidInfo>> {
    const {
        // api,
        locIds,
    } = parameters;

    let infos: Record<string, VoidInfo> = {};
    for(let i = 0; i < locIds.length; ++i) {
        const locId = locIds[i];
        const key = locId.toString();
        if(key in voidMap) {
            infos[locId.toDecimalString()] = voidMap[key];
        }
    }
    return Promise.resolve(infos);
}
