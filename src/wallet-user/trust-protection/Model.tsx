import axios from "axios";
import moment, {Moment} from "moment";
import {DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER, ProtectionRequest} from "../../legal-officer/Types";
import Identity from '../../component/types/Identity';
import PostalAddress from '../../component/types/PostalAddress';
import LegalOfficer from "../../component/types/LegalOfficer";
import { toIsoString } from "../../logion-chain/datetime";
import { sign } from "../../logion-chain";

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

function fakeAddress(i: number) {
    return "1234567890-abcd-" + i;
}

const defaultDetails = "Place de le République Française, 10";

export const legalOfficers: LegalOfficer[] = [
    {name: "Patrick Gielen", address: DEFAULT_LEGAL_OFFICER, details: "Modero Bruxelles\nCentral administration \nNijverheidslaan 1\nB - 1853 Grimbergen (Strombeek-Bever)\nBelgium"},
    {name: "Guillaume Grain", address: ANOTHER_LEGAL_OFFICER, details: "SELARL ADRASTEE\nGare des Brotteaux\n14, place Jules Ferry\n69006 LYON\nFrance"},
    {name: "Alain Barland", address: fakeAddress(5), details: defaultDetails},
    {name: "Ronald Vanswijgenhoven", address: fakeAddress(6), details: defaultDetails},
    {name: "Thibaut Barnier", address: fakeAddress(7), details: defaultDetails},
    {name: "Jona Van Leeuwen", address: fakeAddress(8), details: defaultDetails},
    {name: "Carlos Calvo", address: fakeAddress(9), details: defaultDetails},
    {name: "Ilias Tsipos", address: fakeAddress(10), details: defaultDetails},
    {name: "Pedroso Leal", address: fakeAddress(11), details: defaultDetails},
    {name: "Marc Schmitz", address: fakeAddress(12), details: defaultDetails},
];

export function getOfficer(address: string | undefined): LegalOfficer | null {
    if(address === null) {
        return null;
    }

    for(let i = 0; i < legalOfficers.length; ++i) {
        const legalOfficer = legalOfficers[i];
        if(legalOfficer.address === address) {
            return legalOfficer;
        }
    }
    return null;
}

const unknownLegalOfficer = legalOfficers[2];

export function legalOfficerByAddress(address: string): LegalOfficer {
    const legalOfficer = legalOfficers.find(legalOfficer => legalOfficer.address === address);
    return legalOfficer === undefined ? unknownLegalOfficer : legalOfficer;
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
