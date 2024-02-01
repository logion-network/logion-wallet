import { AxiosInstance } from 'axios';

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
}

export async function acceptProtectionRequest(
    axios: AxiosInstance,
    parameters: AcceptProtectionRequestParameters
): Promise<void> {
    await axios.post(`/api/protection-request/${parameters.requestId}/accept`);
}
