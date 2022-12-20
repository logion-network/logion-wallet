import { AxiosInstance } from 'axios';
import { UUID } from '@logion/node-api/dist/UUID.js';

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

export { getFile } from "./FileModel"
