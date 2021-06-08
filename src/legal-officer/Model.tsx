import axios from 'axios';
import { Moment } from 'moment';
import { toIsoString } from '../logion-chain/datetime';

export const DEFAULT_LEGAL_OFFICER = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"; // Alice

export type TokenizationRequestStatus = "PENDING" | "REJECTED" | "ACCEPTED";

export interface TokenizationRequest {
    id: string,
    legalOfficerAddress: string,
    requesterAddress: string,
    requestedTokenName: string,
    bars: number,
    status: TokenizationRequestStatus,
    rejectReason?: string | null,
    createdOn?: string,
    decisionOn?: string,
    assetDescription?: AssetDescription,
}

export interface FetchRequestSpecification {
    legalOfficerAddress?: string,
    requesterAddress?: string,
    status: TokenizationRequestStatus
}

export async function fetchRequests(specification: FetchRequestSpecification): Promise<TokenizationRequest[]> {
    const response = await axios.put("/api/token-request", specification);
    return response.data.requests;
}

export interface RejectRequestParameters {
    requestId: string,
    signature: string,
    rejectReason: string,
    signedOn: Moment,
}

export async function rejectRequest(parameters: RejectRequestParameters): Promise<void> {
    await axios.post(`/api/token-request/${parameters.requestId}/reject`, {
        signature: parameters.signature,
        rejectReason: parameters.rejectReason,
        signedOn: toIsoString(parameters.signedOn),
    });
}

export interface AcceptRequestParameters {
    requestId: string,
    signature: string,
    signedOn: Moment,
}

export interface AcceptResult {
    sessionToken: string,
}

export async function acceptRequest(parameters: AcceptRequestParameters): Promise<AcceptResult> {
    const response = await axios.post(`/api/token-request/${parameters.requestId}/accept`, {
        signature: parameters.signature,
        signedOn: toIsoString(parameters.signedOn),
    });
    return {
        sessionToken: response.data.sessionToken
    };
}

export interface AssetDescription {
    assetId: string,
    decimals: number,
}

export interface SetAssetDescriptionRequestParameters {
    requestId: string,
    description: AssetDescription,
    sessionToken: string,
}

export async function setAssetDescription(parameters: SetAssetDescriptionRequestParameters): Promise<void> {
    await axios.post(`/api/token-request/${parameters.requestId}/asset`, {
        description: parameters.description,
        sessionToken: parameters.sessionToken,
    });
}

export type LegalOfficerDecisionStatus = "PENDING" | "REJECTED" | "ACCEPTED";

export interface LegalOfficerDecision {
    legalOfficerAddress: string,
    status: LegalOfficerDecisionStatus,
}

export interface ProtectionRequest {
    id: string,
    decisions: LegalOfficerDecision[],
}

export type ProtectionRequestStatus = "PENDING" | "REJECTED" | "ACCEPTED";

export interface FetchProtectionRequestSpecification {
    legalOfficerAddress?: string,
    requesterAddress?: string,
    statuses: ProtectionRequestStatus[],
}

export async function fetchProtectionRequests(
        specification: FetchProtectionRequestSpecification): Promise<ProtectionRequest[]> {
    const response = await axios.put("/api/protection-request", specification);
    return response.data.requests;
}

export interface RejectProtectionRequestParameters {
    requestId: string,
    signature: string,
    rejectReason: string,
    signedOn: Moment,
}

export async function rejectProtectionRequest(parameters: RejectProtectionRequestParameters): Promise<void> {
    await axios.post(`/api/protection-request/${parameters.requestId}/reject`, {
        signature: parameters.signature,
        rejectReason: parameters.rejectReason,
        signedOn: toIsoString(parameters.signedOn),
    });
}

export interface AcceptProtectionRequestParameters {
    requestId: string,
    signature: string,
    signedOn: Moment,
}

export async function acceptProtectionRequest(parameters: AcceptProtectionRequestParameters): Promise<void> {
    await axios.post(`/api/protection-request/${parameters.requestId}/accept`, {
        signature: parameters.signature,
        signedOn: toIsoString(parameters.signedOn),
    });
}
