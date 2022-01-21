import { CreateLocRequest } from "../Model";
import { LocRequest } from "../types/ModelTypes";

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
        status: "OPEN"
    });
}

export const fetchLocRequest = jest.fn();

export const confirmLocFile = jest.fn();
export const confirmLocLink = jest.fn();
export const confirmLocMetadataItem = jest.fn();
export const deleteLocFile = jest.fn();
export const deleteLocLink = jest.fn();
export const deleteLocMetadataItem = jest.fn();
export const preVoid = jest.fn();
export const preClose = jest.fn();

export function resetDefaultMocks() {
    confirmLocFile.mockResolvedValue(undefined);
    confirmLocLink.mockResolvedValue(undefined);
    confirmLocMetadataItem.mockResolvedValue(undefined);
    deleteLocFile.mockResolvedValue(undefined);
    deleteLocLink.mockResolvedValue(undefined);
    deleteLocMetadataItem.mockResolvedValue(undefined);
    preVoid.mockResolvedValue(undefined);
    preClose.mockResolvedValue(undefined);
}
