import { AxiosInstance } from "axios";
import { LegalOfficer, Token, HashOrContent, downloadFile, TypedFile } from "@logion/client";

export const LO_FILE_IDS = [ 'oath-logo', 'header-logo', 'seal' ];

export type LoFileId = typeof LO_FILE_IDS[number];

export const LO_FILE_DESCRIPTION: Record<LoFileId, string> = {
    'header-logo': "Statement of facts: header logo",
    'seal': "Statement of facts: page background",
    'oath-logo': "Statement of facts: oath logo"
}

export function loFileUrl(legalOfficer: LegalOfficer, file: LoFileId, token: Token): string {
    return `${ legalOfficer.node }/api/lo-file/${ legalOfficer.address }/${ file }?jwt_token=${ token.value }`;
}

interface HasLocId {
    locId: string,
}

export interface GetFileParameters extends HasLocId {
    hash: string
}

interface HasCollectionItem {
    collectionItemId: string,
}

export interface GetCollectionItemFileParameters extends GetFileParameters, HasCollectionItem {}

export interface CheckOwnershipParameters extends HasLocId, HasCollectionItem {}

export async function getLoFile(
    parameters: {
        axios: AxiosInstance,
        legalOfficer: string,
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
    return downloadFile(axios, `/api/collection/${ locId }/${ collectionItemId }/files/${ hash }`);
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
    formData.append('file', parameters.file.content as File, parameters.fileId);
    formData.append('hash', parameters.file.contentHash);
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
        collectionItemId: string,
    }
): Promise<ItemDeliveriesResponse> {
    const { locId, collectionItemId } = parameters
    const response = await axios.get(`/api/collection/${ locId }/${ collectionItemId }/latest-deliveries`);
    return response.data;
}

export async function getAllDeliveries(
    axios: AxiosInstance,
    parameters: {
        locId: string,
        collectionItemId: string,
    }
): Promise<ItemDeliveriesResponse> {
    const { locId, collectionItemId } = parameters
    const response = await axios.get(`/api/collection/${ locId }/${ collectionItemId }/all-deliveries`);
    return response.data;
}

export async function getCollectionFile(
    axios: AxiosInstance,
    parameters: GetCollectionItemFileParameters
): Promise<TypedFile> {
    const { locId, collectionItemId, hash } = parameters
    return downloadFile(axios, `/api/collection/${ locId }/files/${ hash }/${ collectionItemId }`);
}

export interface CollectionFileDeliveriesResponse {
    deliveries: CheckLatestDeliveryResponse[];
}

export async function getAllCollectionFileDeliveries(
    axios: AxiosInstance,
    parameters: {
        locId: string,
        hash: string,
    }
): Promise<CollectionFileDeliveriesResponse> {
    const { locId, hash } = parameters
    const response = await axios.get(`/api/collection/${ locId }/file-deliveries/${hash}`);
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
    recordId: string;
}

export async function getTokensRecordFileSource(
    axios: AxiosInstance,
    parameters: GetTokensRecordFileSourceParameters
): Promise<TypedFile> {
    const { locId, recordId, hash } = parameters
    return downloadFile(axios, `/api/records/${ locId }/${ recordId }/files-sources/${ hash }`);
}

export async function getTokensRecordDeliveries(
    axios: AxiosInstance,
    parameters: {
        locId: string,
        recordId: string,
    }
): Promise<ItemDeliveriesResponse> {
    const { locId, recordId } = parameters
    const response = await axios.get(`/api/records/${ locId }/${ recordId }/deliveries`);
    return response.data;
}

export interface GetTokensRecordFileParameters extends GetCollectionItemFileParameters {
    recordId: string,
}

export async function getTokensRecordFile(
    axios: AxiosInstance,
    parameters: GetTokensRecordFileParameters
): Promise<TypedFile> {
    const { locId, recordId, hash, collectionItemId } = parameters
    return downloadFile(axios, `/api/records/${ locId }/${ recordId }/files/${ hash }/${ collectionItemId }`);
}
