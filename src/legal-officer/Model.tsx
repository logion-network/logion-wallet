import { AxiosInstance } from 'axios';
import { PostalAddress, ProtectionRequest, ProtectionRequestStatus, UserIdentity } from '@logion/client';

export interface RecoveryRequest {
    userIdentity: UserIdentity;
    userPostalAddress: PostalAddress;
    createdOn: string;
    status: RecoveryRequestStatus;
    type: RecoveryRequestType;
    id: string;
    rejectReason?: string;
}

export type RecoveryRequestStatus = ProtectionRequestStatus;

export type RecoveryRequestType = "ACCOUNT" | "SECRET";

export function toRecoveryRequestType(value: string | undefined | null): RecoveryRequestType {
    if(value === "ACCOUNT" || value === "SECRET") {
        return value;
    } else {
        throw new Error(`Unexpected value ${ value }`);
    }
}

export async function fetchRecoveryRequests(
    axios: AxiosInstance,
): Promise<RecoveryRequest[]> {
    const response = await axios.put(`/api/recovery-requests`);
    return response.data.requests;
}

export interface RecoveryInfo {
    type: RecoveryRequestType;
    identity1?: {
        userIdentity: UserIdentity;
        userPostalAddress: PostalAddress;
    },
    identity2: {
        userIdentity: UserIdentity;
        userPostalAddress: PostalAddress;
    },
    accountRecovery?: {
        address1: string;
        address2: string;
    },
}

export interface BackendRecoveryInfo {
    addressToRecover: string,
    recoveryAccount: ProtectionRequest,
    accountToRecover?: ProtectionRequest,
}

export async function fetchRecoveryInfo(
    axios: AxiosInstance,
    requestId: string,
    recoveryType: RecoveryRequestType,
): Promise<RecoveryInfo> {
    if(recoveryType === "ACCOUNT") {
        const response = await axios.put(`/api/protection-request/${requestId}/recovery-info`);
        return response.data;
    } else if(recoveryType === "SECRET") {
        const response = await axios.put(`/api/secret-recovery/${requestId}/recovery-info`);
        return response.data;
    } else {
        throw new Error(`Unsupported recovery type ${ recoveryType }`);
    }
}

export interface RejectProtectionRequestParameters {
    requestId: string,
    rejectReason: string,
}

export async function rejectAccountRecoveryRequest(
    axios: AxiosInstance,
    parameters: RejectProtectionRequestParameters
): Promise<void> {
    await axios.post(`/api/protection-request/${parameters.requestId}/reject`, {
        rejectReason: parameters.rejectReason,
    });
}

export interface AcceptProtectionRequestParameters {
    requestId: string,
}

export async function acceptAccountRecoveryRequest(
    axios: AxiosInstance,
    parameters: AcceptProtectionRequestParameters
): Promise<void> {
    await axios.post(`/api/protection-request/${parameters.requestId}/accept`);
}


export async function rejectSecretRecoveryRequest(
    axios: AxiosInstance,
    parameters: RejectProtectionRequestParameters
): Promise<void> {
    await axios.post(`/api/secret-recovery/${parameters.requestId}/reject`, {
        rejectReason: parameters.rejectReason,
    });
}

export interface AcceptProtectionRequestParameters {
    requestId: string,
}

export async function acceptSecretRecoveryRequest(
    axios: AxiosInstance,
    parameters: AcceptProtectionRequestParameters
): Promise<void> {
    await axios.post(`/api/secret-recovery/${parameters.requestId}/accept`);
}
