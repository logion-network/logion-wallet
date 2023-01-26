import { AxiosInstance, AxiosResponse } from "axios";
import { LegalOfficer, Token, MimeType, HashOrContent } from "@logion/client";

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

export interface GetFileParameters {
    locId: string,
    hash: string
}

export interface GetCollectionItemFileParameters extends GetFileParameters {
    collectionItemId: string,
}

export interface TypedFile {
    data: any,
    mimeType: MimeType,
}

export async function getFile(
    axios: AxiosInstance,
    parameters: GetFileParameters
): Promise<TypedFile> {
    return downloadFile(axios, `/api/loc-request/${ parameters.locId }/files/${ parameters.hash }`);
}

async function downloadFile(
    axios: AxiosInstance,
    url: string,
): Promise<TypedFile> {
    const response = await axios.get(url, { responseType: 'blob' });
    return typedFile(response);
}

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

export async function getCollectionItemFileSource(
    axios: AxiosInstance,
    parameters: GetCollectionItemFileParameters
): Promise<TypedFile> {
    const { locId, collectionItemId, hash } = parameters
    return downloadFile(axios, `/api/collection/${ locId }/${ collectionItemId }/files/${ hash }/source`);
}

export async function getJsonLoc(
    axios: AxiosInstance,
    parameters: { locId: string },
): Promise<TypedFile> {
    return downloadFile(axios, `/api/loc-request/${ parameters.locId }`);
}

function typedFile(response: AxiosResponse): TypedFile {
    const contentType: string = response.headers['content-type'];
    return {
        data: response.data,
        mimeType: MimeType.from(contentType),
    };
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

export async function checkCanGetCollectionItemFile(
    axios: AxiosInstance,
    parameters: GetCollectionItemFileParameters
): Promise<boolean> {
    const { locId, collectionItemId, hash } = parameters
    try {
        await axios.get(`/api/collection/${ locId }/${ collectionItemId }/files/${ hash }/check`);
        return true;
    } catch(e) {
        return false;
    }
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

export async function checkCanGetCollectionFile(
    axios: AxiosInstance,
    parameters: GetCollectionItemFileParameters
): Promise<boolean> {
    const { locId, collectionItemId, hash } = parameters
    try {
        await axios.get(`/api/collection/${ locId }/files/${ hash }/${ collectionItemId }/check`);
        return true;
    } catch(e) {
        return false;
    }
}

export async function getCollectionFile(
    axios: AxiosInstance,
    parameters: GetCollectionItemFileParameters
): Promise<TypedFile> {
    const { locId, collectionItemId, hash } = parameters
    return downloadFile(axios, `/api/collection/${ locId }/files/${ hash }/${ collectionItemId }`);
}
