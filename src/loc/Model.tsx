import { AxiosInstance } from 'axios';
import { UUID } from '@logion/node-api/dist/UUID';

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

export interface AddLinkParameters {
    locId: string,
    target: string,
    nature: string
}

export async function addLink(
    axios: AxiosInstance,
    parameters: AddLinkParameters
): Promise<void> {
    const { target, nature } = parameters;
    await axios.post(`/api/loc-request/${ parameters.locId }/links`, { target, nature })
}

export interface AddMetadataParameters {
    locId: string,
    name: string,
    value: string,
    submitter: string,
}

export async function addMetadata(
    axios: AxiosInstance,
    parameters: AddMetadataParameters
): Promise<void> {
    const { name, value } = parameters;
    await axios.post(`/api/loc-request/${ parameters.locId }/metadata`, { name, value })
}

export { addFile, getFile } from "./FileModel"
