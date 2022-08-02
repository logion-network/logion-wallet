import { AxiosInstance, AxiosResponse } from "axios";

export const LO_FILE_IDS = ['sof-header']

export type LoFileId = typeof LO_FILE_IDS[number];

export const LO_FILE_DESCRIPTION: Record<LoFileId, string> = {
    'sof-header': "Header of the Statement of facts"
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
    extension: string
}

export async function getFile(
    axios: AxiosInstance,
    parameters: GetFileParameters
): Promise<TypedFile> {
    const response = await axios.get(`/api/loc-request/${ parameters.locId }/files/${ parameters.hash }`, { responseType: 'blob' });
    return typedFile(response);
}

export async function getLoFile(
    axios: AxiosInstance,
    parameters: { fileId: LoFileId },
): Promise<TypedFile> {
    const response = await axios.get(`/api/lo-file/${ parameters.fileId }`, { responseType: 'blob' });
    return typedFile(response);
}

export async function getCollectionItemFile(
    axios: AxiosInstance,
    parameters: GetCollectionItemFileParameters
): Promise<TypedFile> {
    const { locId, collectionItemId, hash } = parameters
    const response = await axios.get(
        `/api/collection/${ locId }/${ collectionItemId }/files/${ hash }`,
        { responseType: 'blob' }
    );
    return typedFile(response);
}


function typedFile(response: AxiosResponse): TypedFile {
    const contentType: string = response.headers['content-type'];
    return { data: response.data, extension: determineExtension(contentType) };
}

function determineExtension(contentType: string) {
    if (!contentType || contentType.indexOf("/") < 0) {
        return "txt"
    }
    return contentType.split("/")[1];
}

export interface AddFileParameters {
    locId: string,
    file: File,
    fileName: string,
    nature: string,
    submitter: string,
}

export interface AddFileResult {
    hash: string
}

export async function addFile(
    axios: AxiosInstance,
    parameters: AddFileParameters
): Promise<AddFileResult> {
    const formData = new FormData();
    formData.append('file', parameters.file, parameters.fileName);
    formData.append('nature', parameters.nature);
    const response = await axios.post(
        `/api/loc-request/${ parameters.locId }/files`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } })
    return response.data;
}

export interface AddLoFileParameters {
    file: File,
    fileId: LoFileId,
}

export async function addLoFile(
    axios: AxiosInstance,
    parameters: AddLoFileParameters
): Promise<void> {
    const formData = new FormData();
    formData.append('file', parameters.file, parameters.fileId);
    await axios.put(
        `/api/lo-file/${ parameters.fileId }`,
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
