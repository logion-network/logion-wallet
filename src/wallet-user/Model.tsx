import { AxiosInstance } from "axios";
import { Moment } from 'moment';
import { TokenizationRequest } from "../common/types/ModelTypes";

export interface CreateTokenRequest {
    legalOfficerAddress: string,
    requesterAddress: string,
    requestedTokenName: string,
    bars: number,
    signature: string,
    signedOn: Moment,
}

export async function createTokenRequest(
    axios: AxiosInstance,
    request: CreateTokenRequest
): Promise<TokenizationRequest> {
    const response = await axios.post("/api/token-request", request);
    return response.data;
}
