import { LocRequest } from "@logion/client";
import { CreateLocRequest } from "../Model";

export let fetchProtectionRequests = jest.fn();

export function setFetchProtectionRequests(mockFn: any) {
    fetchProtectionRequests = mockFn;
}

export async function createLocRequest(axios: any, request: CreateLocRequest): Promise<LocRequest> {
    return Promise.resolve({
        ...request,
        createdOn: "2022-01-20T09:24:00.000",
        description: "Test",
        files: [],
        id: "671e65cf-42c3-435b-a222-be008e7fb3d1",
        links: [],
        metadata: [],
        status: "OPEN",
        verifiedThirdParty: false,
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
