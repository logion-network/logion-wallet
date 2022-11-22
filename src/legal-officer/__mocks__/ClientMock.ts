import { VerifiedThirdPartySelection } from "../client";
import { OpenLoc } from "@logion/client";

export let closeLoc = jest.fn().mockResolvedValue(undefined);

export function setCloseLocMock(mock: any) {
    closeLoc = mock;
}

export let deleteLink = jest.fn().mockResolvedValue(undefined);

export let voidLoc = jest.fn().mockResolvedValue(undefined);

export function setVoidLocMock(mock: any) {
    voidLoc = mock;
}

let vtpSelections: VerifiedThirdPartySelection[] = [];

export async function getVerifiedThirdPartySelections(params: { locState: OpenLoc } ): Promise<VerifiedThirdPartySelection[]> {
    return Promise.resolve(vtpSelections);
}

export function setVerifiedThirdPartySelections(mock: VerifiedThirdPartySelection[]) {
    vtpSelections = mock;
}
