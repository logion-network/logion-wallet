import { AxiosInstance } from 'axios';
import { UserIdentity } from '@logion/client';
import { ProtectionRequest, ProtectionRequestStatus } from '@logion/client/dist/RecoveryClient';
import { UUID } from '@logion/node-api/dist/UUID';
import { LocType, IdentityLocType, LegalOfficerCase } from '@logion/node-api/dist/Types';

import {
    LocRequest,
    LocRequestStatus, LocCollectionItem,
} from './types/ModelTypes';

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

export interface FetchLocRequestSpecification {
    ownerAddress?: string,
    requesterAddress?: string,
    statuses: LocRequestStatus[],
    locTypes: LocType[],
    identityLocType?: IdentityLocType
}

export async function fetchLocRequests(
    axios: AxiosInstance,
    specification: FetchLocRequestSpecification,
): Promise<LocRequest[]> {
    const response = await axios.put(`/api/loc-request`, specification);
    return response.data.requests;
}

export async function fetchLocRequest(
    axios: AxiosInstance,
    requestId: string
): Promise<LocRequest> {
    const response = await axios.get(`/api/loc-request/${ requestId }`);
    return response.data;
}

export async function fetchPublicLoc(
    axios: AxiosInstance,
    requestId: string
): Promise<LocRequest> {
    const response = await axios.get(`/api/loc-request/${ requestId }/public`);
    return response.data;
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

export interface CreateSofRequest {
    locId: string;
    itemId?: string;
}

export async function createSofRequest(
    axios: AxiosInstance,
    request: CreateSofRequest,
): Promise<LocRequest> {
    const response = await axios.post(`/api/loc-request/sof`, request);
    return response.data;
}

export async function confirmLocFile(
    axios: AxiosInstance,
    locId: UUID,
    hash: string
): Promise<void> {
    const requestId = locId.toString();
    await axios.put(`/api/loc-request/${requestId}/files/${hash}/confirm`);
}

export async function deleteLocFile(
    axios: AxiosInstance,
    locId: UUID,
    hash: string
): Promise<void> {
    const requestId = locId.toString();
    await axios.delete(`/api/loc-request/${requestId}/files/${hash}`);
}

export async function confirmLocLink(
    axios: AxiosInstance,
    locId: UUID,
    targetId: UUID
): Promise<void> {
    const requestId = locId.toString();
    const target = targetId.toString();
    await axios.put(`/api/loc-request/${requestId}/links/${target}/confirm`);
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

export async function confirmLocMetadataItem(
    axios: AxiosInstance,
    locId: UUID,
    name: string
): Promise<void> {
    const requestId = locId.toString();
    await axios.put(`/api/loc-request/${requestId}/metadata/${(encodeURIComponent(name))}/confirm`);
}

export async function deleteLocMetadataItem(
    axios: AxiosInstance,
    locId: UUID,
    name: string
): Promise<void> {
    const requestId = locId.toString();
    await axios.delete(`/api/loc-request/${requestId}/metadata/${(encodeURIComponent(name))}`);
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

export async function fetchPublicCollectionItem(
    axios: AxiosInstance,
    collectionLocId: string,
    itemId: string,
): Promise<LocCollectionItem> {
    const response = await axios.get(`/api/collection/${ collectionLocId }/${ itemId }`);
    return response.data;
}

export function isGrantedAccess(address: string | undefined, loc: LegalOfficerCase): boolean {
    return loc.owner === address || loc.requesterAddress === address;
}
