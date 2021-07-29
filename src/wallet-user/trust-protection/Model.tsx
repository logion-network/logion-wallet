import axios from "axios";
import moment, {Moment} from "moment";
import {ProtectionRequest} from "../../common/types/ModelTypes";
import Identity from '../../common/types/Identity';
import PostalAddress from '../../common/types/PostalAddress';
import { toIsoString } from "../../logion-chain/datetime";
import { sign } from "../../logion-chain/Signature";

export interface CreateProtectionRequest {
    requesterAddress: string,
    userIdentity: Identity,
    userPostalAddress: PostalAddress,
    legalOfficerAddresses: string[],
    signature: string,
    signedOn: Moment,
    isRecovery: boolean,
    addressToRecover: string,
}

export interface CheckProtectionActivationParameters {
    requestId: string,
    userAddress: string,
    signature: string,
    signedOn: Moment,
}

export type LegalOfficerDecisionStatus = "PENDING" | "REJECTED" | "ACCEPTED";

export interface LegalOfficerDecision {
    legalOfficerAddress: string,
    status: LegalOfficerDecisionStatus
}

export async function createProtectionRequest(request: CreateProtectionRequest): Promise<ProtectionRequest> {
    const response = await axios.post("/api/protection-request", request);
    return response.data;
}

async function _checkActivation(parameters: CheckProtectionActivationParameters): Promise<void> {
    await axios.post(`/api/protection-request/${parameters.requestId}/check-activation`, {
        signature: parameters.signature,
        userAddress: parameters.userAddress,
        signedOn: toIsoString(parameters.signedOn),
    });
}

export async function checkActivation(protectionRequest: ProtectionRequest): Promise<void> {
    const attributes = [
        `${protectionRequest.id}`,
    ];
    const signedOn = moment();
    const signature = await sign({
        signerId: protectionRequest.requesterAddress,
        resource: 'protection-request',
        operation: 'check-activation',
        signedOn,
        attributes
    });
    await _checkActivation({
        requestId: protectionRequest.id,
        userAddress: protectionRequest.requesterAddress,
        signedOn,
        signature
    });
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
