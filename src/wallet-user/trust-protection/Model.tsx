import { AxiosInstance } from "axios";
import { ProtectionRequest } from "../../common/types/ModelTypes";
import Identity from '../../common/types/Identity';
import PostalAddress from '../../common/types/PostalAddress';

export interface CreateProtectionRequest {
    requesterAddress: string,
    userIdentity: Identity,
    userPostalAddress: PostalAddress,
    isRecovery: boolean,
    addressToRecover: string,
    otherLegalOfficerAddress: string,
}

export interface CheckProtectionActivationParameters {
    requestId: string,
    userAddress: string,
}

export async function createProtectionRequest(
    axios: AxiosInstance,
    request: CreateProtectionRequest
): Promise<ProtectionRequest> {
    const response = await axios.post("/api/protection-request", request);
    return response.data;
}

export interface FindRequestParameters {
    address: string,
    requests: ProtectionRequest[],
}

export function findRequest(parameters: FindRequestParameters): ProtectionRequest | null {
    const { address, requests } = parameters;
    for(let i = 0; i < requests.length; ++i) {
        const request = requests[i];
        if(request.requesterAddress === address) {
            return request;
        }
    }
    return null;
}

export function isRecovery(request: ProtectionRequest | null) {
    return request !== null && request.isRecovery;
}
