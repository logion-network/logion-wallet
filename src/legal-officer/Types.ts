import Identity from '../component/types/Identity';
import PostalAddress from '../component/types/PostalAddress';

export const DEFAULT_LEGAL_OFFICER = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"; // Alice
export const ANOTHER_LEGAL_OFFICER = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"; // Bob

const LEGAL_OFFICERS: string[] = [ DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER ];

export function isLegalOfficer(address: string): boolean {
    return LEGAL_OFFICERS.includes(address);
}

export type TokenizationRequestStatus = "PENDING" | "REJECTED" | "ACCEPTED";

export interface AssetDescription {
    assetId: string,
    decimals: number,
}

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
    assetDescription?: AssetDescription,
}

export type LegalOfficerDecisionStatus = "PENDING" | "REJECTED" | "ACCEPTED";

export interface LegalOfficerDecision {
    legalOfficerAddress: string,
    status: LegalOfficerDecisionStatus,
    rejectReason: string | null,
    decisionOn: string | null,
}

export interface ProtectionRequest {
    id: string,
    requesterAddress: string,
    decisions: LegalOfficerDecision[],
    userIdentity: Identity,
    userPostalAddress: PostalAddress,
    createdOn: string
}
