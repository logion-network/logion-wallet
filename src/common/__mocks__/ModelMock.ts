import { LocRequest } from "@logion/client";
import { ValidAccountId } from "@logion/node-api";
import { CreateLocRequest } from "../Model";
import { mockValidAccountId } from "src/__mocks__/LogionMock";

export let fetchProtectionRequests = jest.fn();

export function setFetchProtectionRequests(mockFn: any) {
    fetchProtectionRequests = mockFn;
}

let authenticatedUser: ValidAccountId | undefined = undefined;

export function setAuthenticatedUser(_authenticatedUser: ValidAccountId | undefined) {
    authenticatedUser = _authenticatedUser;
}

export async function createLocRequest(axios: any, request: CreateLocRequest): Promise<LocRequest> {
    return Promise.resolve({
        ...request,
        requesterAddress: request.requesterAddress ? mockValidAccountId(request.requesterAddress?.address, request.requesterAddress?.type || "Polkadot") : authenticatedUser,
        createdOn: "2022-01-20T09:24:00.000",
        description: "Test",
        files: [],
        id: "671e65cf-42c3-435b-a222-be008e7fb3d1",
        links: [],
        metadata: [],
        status: "OPEN",
        verifiedIssuer: false,
        selectedIssuers: [],
    });
}

export const preVoid = jest.fn();

export function resetDefaultMocks() {
    preVoid.mockResolvedValue(undefined);
}

export function isGrantedAccess() {
    return true;
}
