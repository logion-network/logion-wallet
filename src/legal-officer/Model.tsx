import { AxiosInstance } from 'axios';

import { AssetDescription, LegalOfficerDecision, } from '../common/types/ModelTypes';
import { RecoveryInfo } from './Types';

export interface RejectRequestParameters {
    requestId: string,
    rejectReason: string,
}

export async function rejectRequest(
    axios: AxiosInstance,
    parameters: RejectRequestParameters
): Promise<void> {
    await axios.post(`/api/token-request/${parameters.requestId}/reject`, {
        rejectReason: parameters.rejectReason,
    });
}

export interface AcceptRequestParameters {
    requestId: string,
}

export async function acceptRequest(
    axios: AxiosInstance,
    parameters: AcceptRequestParameters
): Promise<void> {
    await axios.post(`/api/token-request/${parameters.requestId}/accept`);
}

export interface SetAssetDescriptionRequestParameters {
    requestId: string,
    description: AssetDescription,
}

export async function setAssetDescription(
    axios: AxiosInstance,
    parameters: SetAssetDescriptionRequestParameters
): Promise<void> {
    await axios.post(`/api/token-request/${parameters.requestId}/asset`, {
        description: parameters.description,
    });
}

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
    legalOfficerAddress: string,
}

export async function acceptProtectionRequest(
    axios: AxiosInstance,
    parameters: AcceptProtectionRequestParameters
): Promise<void> {
    await axios.post(`/api/protection-request/${parameters.requestId}/accept`, {
        legalOfficerAddress: parameters.legalOfficerAddress,
    });
}

export function decision(legalOfficerAddress: string | undefined, decisions: LegalOfficerDecision[]): (LegalOfficerDecision | null) {
    for(let i = 0; i < decisions.length; ++i) {
        const decision = decisions[i];
        if(decision.legalOfficerAddress === legalOfficerAddress) {
            return decision;
        }
    }
    return null;
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

export async function getFile(
    axios: AxiosInstance,
    parameters: GetFileParameters
):Promise<any> {
    const response = axios.get(`/api/loc-request/${ parameters.locId }/files/${ parameters.hash }`, { responseType: 'blob' });
    return response.then(response => response.data);
}
