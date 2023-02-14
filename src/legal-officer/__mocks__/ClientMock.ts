import { OpenLoc, VerifiedThirdParty } from "@logion/client";
import { VerifiedThirdPartyWithSelect } from "../client";

export let closeLoc = jest.fn().mockResolvedValue(undefined);

export function setCloseLocMock(mock: any) {
    closeLoc = mock;
}

export let deleteLink = jest.fn().mockResolvedValue(undefined);

export let voidLoc = jest.fn().mockResolvedValue(undefined);

export function setVoidLocMock(mock: any) {
    voidLoc = mock;
}

let vtpSelections: VerifiedThirdPartyWithSelect[] = [];

export async function getVerifiedThirdPartySelections(params: { locState: OpenLoc } ): Promise<VerifiedThirdParty[]> {
    return Promise.resolve(vtpSelections);
}

export function setVerifiedThirdPartySelections(mock: VerifiedThirdPartyWithSelect[]) {
    vtpSelections = mock;
}

export let requestVote = jest.fn().mockResolvedValue(undefined);

export function setRequestVoteMock(mock: any) {
    requestVote = mock;
}
