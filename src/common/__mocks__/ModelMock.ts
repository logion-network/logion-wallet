import { ValidAccountId } from "@logion/node-api";

export let fetchProtectionRequests = jest.fn();

export function setFetchProtectionRequests(mockFn: any) {
    fetchProtectionRequests = mockFn;
}

let authenticatedUser: ValidAccountId | undefined = undefined;

export function setAuthenticatedUser(_authenticatedUser: ValidAccountId | undefined) {
    authenticatedUser = _authenticatedUser;
}

export const preVoid = jest.fn();

export function resetDefaultMocks() {
    preVoid.mockResolvedValue(undefined);
}

export function isGrantedAccess() {
    return true;
}
