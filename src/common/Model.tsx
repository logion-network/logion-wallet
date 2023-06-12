import { AxiosInstance } from 'axios';
import { LocData } from '@logion/client';
import { ProtectionRequest, ProtectionRequestStatus } from '@logion/client/dist/RecoveryClient.js';

export type ProtectionRequestKind = 'RECOVERY' | 'PROTECTION_ONLY' | 'ANY';

export interface FetchProtectionRequestSpecification {
    legalOfficerAddress?: string,
    requesterAddress?: string,
    kind?: ProtectionRequestKind,
    statuses?: ProtectionRequestStatus[],
}

export async function fetchProtectionRequests(
    axios: AxiosInstance,
    specification: FetchProtectionRequestSpecification): Promise<ProtectionRequest[]> {
    const response = await axios.put("/api/protection-request", specification);
    return response.data.requests;
}

export function isGrantedAccess(address: string | undefined, loc: LocData): boolean {
    return loc.ownerAddress === address || loc.requesterAddress === address;
}
