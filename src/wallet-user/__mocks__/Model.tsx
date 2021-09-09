import { AxiosInstance } from "axios";
import { TokenizationRequest } from "../../common/types/ModelTypes";
import { CreateTokenRequest } from "../Model";

export async function createTokenRequest(axios: AxiosInstance, request: CreateTokenRequest): Promise<TokenizationRequest> {
    return Promise.resolve({
        id: "1234",
        legalOfficerAddress: request.legalOfficerAddress,
        requesterAddress: request.requesterAddress,
        requestedTokenName: request.requestedTokenName,
        bars: request.bars,
        status: "PENDING"
    });
}
