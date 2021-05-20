import axios from "axios";
import {TokenizationRequest} from "../legal-officer/Model";

export interface CreateTokenRequest {
    legalOfficerAddress: string,
    requesterAddress: string,
    requestedTokenName: string,
    bars: number,
}

export async function createTokenRequest(request: CreateTokenRequest): Promise<TokenizationRequest> {
    const response = await axios.post("/api/token-request", request);
    return response.data;
}
