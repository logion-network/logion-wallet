import { AxiosInstance } from 'axios';
import { UserIdentity, LocData, LocRequest } from '@logion/client';
import { ProtectionRequest, ProtectionRequestStatus } from '@logion/client/dist/RecoveryClient';
import { UUID, LocType } from '@logion/node-api';

export type ProtectionRequestKind = 'RECOVERY' | 'PROTECTION_ONLY' | 'ANY';

export interface FetchProtectionRequestSpecification {
    requesterAddress?: string,
    kind: ProtectionRequestKind,
    statuses?: ProtectionRequestStatus[],
}

export async function fetchProtectionRequests(
    axios: AxiosInstance,
    specification: FetchProtectionRequestSpecification): Promise<ProtectionRequest[]> {
    const response = await axios.put("/api/protection-request", specification);
    return response.data.requests;
}

export interface FetchTransactionsSpecification {
    address: string,
}

export interface CreateLocRequest {
    ownerAddress: string;
    requesterAddress?: string;
    requesterIdentityLoc?: string;
    description: string;
    locType: LocType;
    userIdentity?: UserIdentity;
}

export async function createLocRequest(
    axios: AxiosInstance,
    request: CreateLocRequest,
): Promise<LocRequest> {
    const response = await axios.post(`/api/loc-request`, request);
    return response.data;
}

export async function deleteLocLink(
    axios: AxiosInstance,
    locId: UUID,
    targetId: UUID
): Promise<void> {
    const requestId = locId.toString();
    const target = targetId.toString();
    await axios.delete(`/api/loc-request/${requestId}/links/${target}`);
}

export async function preClose(
    axios: AxiosInstance,
    locId: UUID,
): Promise<void> {
    const requestId = locId.toString();
    await axios.post(`/api/loc-request/${requestId}/close`);
}

export async function preVoid(
    axios: AxiosInstance,
    locId: UUID,
    reason: string,
): Promise<void> {
    const requestId = locId.toString();
    await axios.post(`/api/loc-request/${requestId}/void`, {
        reason
    });
}

export function isGrantedAccess(address: string | undefined, loc: LocData): boolean {
    return loc.ownerAddress === address || loc.requesterAddress === address;
}
