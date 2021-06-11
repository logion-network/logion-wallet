import axios from "axios";
import {Moment} from "moment";
import {DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER, ProtectionRequest} from "../../legal-officer/Types";
import Identity from '../../component/types/Identity';
import PostalAddress from '../../component/types/PostalAddress';

export interface CreateProtectionRequest {
    requesterAddress: string,
    userIdentity: Identity,
    userPostalAddress: PostalAddress,
    legalOfficerAddresses: string[],
    signature: string,
    signedOn: Moment
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

function fakeAddress(i: number) {
    return "1234567890-abcd-" + i;
}

export const legalOfficers = [
    {name: "Patrick", address: DEFAULT_LEGAL_OFFICER},
    {name: "Guillaume", address: ANOTHER_LEGAL_OFFICER},
    {name: "Alain", address: fakeAddress(5)},
    {name: "Ronald", address: fakeAddress(6)},
    {name: "Thibaut", address: fakeAddress(7)},
    {name: "Jona", address: fakeAddress(8)},
    {name: "Carlos", address: fakeAddress(9)},
    {name: "Ilias", address: fakeAddress(10)},
    {name: "Pedroso", address: fakeAddress(11)},
    {name: "Marc", address: fakeAddress(12)},
]

export function legalOfficerName(address: string): string {
    const legalOfficer = legalOfficers.find(legalOfficer => legalOfficer.address === address);
    return legalOfficer === undefined ? "Unknown" : legalOfficer.name;
}

