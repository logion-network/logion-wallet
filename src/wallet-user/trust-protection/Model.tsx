import axios from "axios";
import {Moment} from "moment";

export const DEFAULT_LEGAL_OFFICER = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"; // Alice
export const ANOTHER_LEGAL_OFFICER = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"; // Bob

export interface UserIdentity {
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string
}

export interface PostalAddress {
    line1: string,
    line2: string,
    postalCode: string,
    city: string,
    country: string
}

export interface CreateProtectionRequest {
    requesterAddress: string,
    userIdentity: UserIdentity,
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

export interface ProtectionRequest {
    id: string,
    decisions: LegalOfficerDecision[]
}

export async function createProtectionRequest(request: CreateProtectionRequest): Promise<ProtectionRequest> {
    const response = await axios.post("/api/protection-request", request);
    return response.data;
}

function fakeAddress(i: number) {
    return "1234567890-abcd-" + i;
}

export const legalOfficers = [
    {name: "Alice", address: DEFAULT_LEGAL_OFFICER},
    {name: "Bob", address: ANOTHER_LEGAL_OFFICER},
    {name: "Patrick", address: fakeAddress(3)},
    {name: "Guillaume", address: fakeAddress(4)},
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

