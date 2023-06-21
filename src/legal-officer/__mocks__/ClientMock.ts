import { OpenLoc, VerifiedIssuer } from "@logion/client";
import { VerifiedIssuerWithSelect } from "../client";

let issuerSelections: VerifiedIssuerWithSelect[] = [];

export async function getVerifiedIssuerSelections(params: { locState: OpenLoc } ): Promise<VerifiedIssuer[]> {
    return Promise.resolve(issuerSelections);
}

export function setVerifiedIssuerSelections(mock: VerifiedIssuerWithSelect[]) {
    issuerSelections = mock;
}

export let requestVote = jest.fn().mockResolvedValue(undefined);

export function setRequestVoteMock(mock: any) {
    requestVote = mock;
}
