import { AxiosInstance } from 'axios';
import { UUID } from '../logion-chain/UUID';

import { RecoveryInfo } from './Types';

export interface RejectProtectionRequestParameters {
    requestId: string,
    rejectReason: string,
    legalOfficerAddress: string,
}

export async function rejectProtectionRequest(
    axios: AxiosInstance,
    parameters: RejectProtectionRequestParameters
): Promise<void> {
    await axios.post(`/api/protection-request/${parameters.requestId}/reject`, {
        legalOfficerAddress: parameters.legalOfficerAddress,
        rejectReason: parameters.rejectReason,
    });
}

export interface AcceptProtectionRequestParameters {
    requestId: string,
    locId: UUID,
}

export async function acceptProtectionRequest(
    axios: AxiosInstance,
    parameters: AcceptProtectionRequestParameters
): Promise<void> {
    await axios.post(`/api/protection-request/${parameters.requestId}/accept`, {
        locId: parameters.locId.toString(),
    });
}

export async function fetchRecoveryInfo(
    axios: AxiosInstance,
    requestId: string
): Promise<RecoveryInfo> {
    const response = await axios.put(`/api/protection-request/${requestId}/recovery-info`, {})
    return response.data;
}

export interface RejectLocRequestParameters {
    requestId: string;
    rejectReason: string;
}

export async function rejectLocRequest(
    axios: AxiosInstance,
    parameters: RejectLocRequestParameters
): Promise<void> {
    await axios.post(`/api/loc-request/${parameters.requestId}/reject`, {
        rejectReason: parameters.rejectReason,
    });
}

export interface AcceptLocRequestParameters {
    requestId: string;
}

export async function acceptLocRequest(
    axios: AxiosInstance,
    parameters: AcceptLocRequestParameters
): Promise<void> {
    await axios.post(`/api/loc-request/${parameters.requestId}/accept`, { });
}

export interface AddFileParameters {
    locId: string,
    file: File,
    fileName: string
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
    const response = await axios.post(
        `/api/loc-request/${ parameters.locId }/files`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } })
    return response.data;
}

export interface GetFileParameters {
    locId: string,
    hash: string
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
    const contentType:string = response.headers['content-type'];
    return { data: response.data, extension: determineExtension(contentType) };
}

function determineExtension(contentType: string) {
    if (!contentType || contentType.indexOf("/") < 0) {
        return "txt"
    }
    return contentType.split("/")[1];
}
