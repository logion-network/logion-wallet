import axios from 'axios';

export const DEFAULT_LEGAL_OFFICER = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"; // Alice

export type TokenizationRequestStatus = "PENDING" | "REJECTED";

export interface TokenizationRequest {
    id: string,
    legalOfficerAddress: string,
    requesterAddress: string,
    requestedTokenName: string,
    bars: number,
    status: TokenizationRequestStatus,
}

export interface FetchRequestSpecification {
    legalOfficerAddress: string,
    status: TokenizationRequestStatus
}

export async function fetchRequests(specification: FetchRequestSpecification): Promise<TokenizationRequest[]> {
    const response = await axios.put("/api/token-request", specification);
    return response.data.requests;
}

export async function rejectRequest(requestId: string): Promise<void> {
    await axios.post(`/api/token-request/${requestId}/reject`);
}
