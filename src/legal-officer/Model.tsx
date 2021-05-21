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
    rejectReason?: string | null,
    createdOn?: string,
    decisionOn?: string,
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
    legalOfficerAddress: string,
    rejectReason: string,
}

export async function rejectRequest(parameters: RejectRequestParameters): Promise<void> {
    await axios.post(`/api/token-request/${parameters.requestId}/reject`, {
        legalOfficerAddress: parameters.legalOfficerAddress,
        signature: parameters.signature,
        rejectReason: parameters.rejectReason,
    });
}
