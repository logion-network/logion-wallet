import { AxiosInstance } from 'axios';
import { LocData, ProtectionRequest, ProtectionRequestStatus } from '@logion/client';
import { ValidAccountId } from "@logion/node-api";

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

export function isGrantedAccess(address: ValidAccountId | undefined, loc: LocData): boolean {
    return loc.ownerAccountId.equals(address) || (loc.requesterAccountId?.equals(address) || false);
}
