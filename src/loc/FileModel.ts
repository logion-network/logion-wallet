import { AxiosInstance } from "axios";
import { LegalOfficer, Token, HashOrContent, downloadFile, TypedFile } from "@logion/client";
import { Hash, ValidAccountId } from "@logion/node-api";
import { BrowserFile } from "@logion/client-browser";

export const LO_FILE_IDS = [ 'oath-logo', 'header-logo', 'seal' ];

export type LoFileId = typeof LO_FILE_IDS[number];

export const LO_FILE_DESCRIPTION: Record<LoFileId, string> = {
    'header-logo': "Statement of facts: header logo",
    'seal': "Statement of facts: page background",
    'oath-logo': "Statement of facts: oath logo"
}

export function loFileUrl(legalOfficer: LegalOfficer, file: LoFileId, token: Token): string {
    return `${ legalOfficer.node }/api/lo-file/${ legalOfficer.account.address }/${ file }?jwt_token=${ token.value }`;
}

interface HasLocId {
    locId: string,
}

export interface GetFileParameters extends HasLocId {
    hash: Hash
}

interface HasCollectionItem {
    collectionItemId: Hash,
}

export interface GetCollectionItemFileParameters extends GetFileParameters, HasCollectionItem {}

export interface CheckOwnershipParameters extends HasLocId, HasCollectionItem {}

export async function getLoFile(
    parameters: {
        axios: AxiosInstance,
        legalOfficer: ValidAccountId,
        fileId: LoFileId,
    },
): Promise<TypedFile> {
    return downloadFile(parameters.axios, `/api/lo-file/${ parameters.legalOfficer }/${ parameters.fileId }`);
}

export async function getCollectionItemFile(
    axios: AxiosInstance,
    parameters: GetCollectionItemFileParameters
): Promise<TypedFile> {
    const { locId, collectionItemId, hash } = parameters
    return downloadFile(axios, `/api/collection/${ locId }/${ collectionItemId.toHex() }/files/${ hash.toHex() }`);
}

export async function getJsonLoc(
    axios: AxiosInstance,
    parameters: { locId: string },
): Promise<TypedFile> {
    return downloadFile(axios, `/api/loc-request/${ parameters.locId }`);
}

export interface AddLoFileParameters {
    axios: AxiosInstance,
    legalOfficer: string,
    file: HashOrContent,
    fileId: LoFileId,
}

export async function addLoFile(
    parameters: AddLoFileParameters
): Promise<void> {
    await parameters.file.finalize();
    const formData = new FormData();
    formData.append('file', (parameters.file.content as BrowserFile).getBlob(), parameters.fileId);
    formData.append('hash', parameters.file.contentHash.toHex());
    await parameters.axios.put(
        `/api/lo-file/${ parameters.legalOfficer }/${ parameters.fileId }`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } })
}

export interface CheckLatestDeliveryResponse {
    copyHash: string;
    generatedOn: string;
    owner: string;
    belongsToCurrentOwner: boolean;
}

export interface ItemDeliveriesResponse {
    [key: string]: CheckLatestDeliveryResponse[];
}

export async function getLatestDeliveries(
    axios: AxiosInstance,
    parameters: {
        locId: string,
        collectionItemId: Hash,
    }
): Promise<ItemDeliveriesResponse> {
    const { locId, collectionItemId } = parameters
    const response = await axios.get(`/api/collection/${ locId }/${ collectionItemId.toHex() }/latest-deliveries`);
    return response.data;
}

export async function getAllDeliveries(
    axios: AxiosInstance,
    parameters: {
        locId: string,
        collectionItemId: Hash,
    }
): Promise<ItemDeliveriesResponse> {
    const { locId, collectionItemId } = parameters
    const response = await axios.get(`/api/collection/${ locId }/${ collectionItemId.toHex() }/all-deliveries`);
    return response.data;
}

export async function getCollectionFile(
    axios: AxiosInstance,
    parameters: GetCollectionItemFileParameters
): Promise<TypedFile> {
    const { locId, collectionItemId, hash } = parameters
    return downloadFile(axios, `/api/collection/${ locId }/files/${ hash.toHex() }/${ collectionItemId.toHex() }`);
}

export interface CollectionFileDeliveriesResponse {
    deliveries: CheckLatestDeliveryResponse[];
}

export async function getAllCollectionFileDeliveries(
    axios: AxiosInstance,
    parameters: {
        locId: string,
        hash: Hash,
    }
): Promise<CollectionFileDeliveriesResponse> {
    const { locId, hash } = parameters
    const response = await axios.get(`/api/collection/${ locId }/file-deliveries/${ hash.toHex() }`);
    return response.data;
}

export interface CollectionDeliveriesResponse {
    [key: string]: CheckLatestDeliveryResponse[];
}

export async function getAllCollectionDeliveries(
    axios: AxiosInstance,
    parameters: {
        locId: string,
    }
): Promise<CollectionDeliveriesResponse> {
    const { locId } = parameters
    const response = await axios.get(`/api/collection/${ locId }/file-deliveries`);
    return response.data;
}

export interface GetTokensRecordFileSourceParameters extends GetFileParameters {
    recordId: Hash;
}

export async function getTokensRecordFileSource(
    axios: AxiosInstance,
    parameters: GetTokensRecordFileSourceParameters
): Promise<TypedFile> {
    const { locId, recordId, hash } = parameters
    return downloadFile(axios, `/api/records/${ locId }/${ recordId.toHex() }/files-sources/${ hash.toHex() }`);
}

export async function getTokensRecordDeliveries(
    axios: AxiosInstance,
    parameters: {
        locId: string,
        recordId: Hash,
    }
): Promise<ItemDeliveriesResponse> {
    const { locId, recordId } = parameters
    const response = await axios.get(`/api/records/${ locId }/${ recordId.toHex() }/deliveries`);
    return response.data;
}

export interface GetTokensRecordFileParameters extends GetCollectionItemFileParameters {
    recordId: Hash,
}

export async function getTokensRecordFile(
    axios: AxiosInstance,
    parameters: GetTokensRecordFileParameters
): Promise<TypedFile> {
    const { locId, recordId, hash, collectionItemId } = parameters
    return downloadFile(axios, `/api/records/${ locId }/${ recordId.toHex() }/files/${ hash.toHex() }/${ collectionItemId.toHex() }`);
}
