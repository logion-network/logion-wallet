export const DEFAULT_LEGAL_OFFICER = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"; // Alice
export const ANOTHER_LEGAL_OFFICER = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"; // Bob

export let fetchRequests = jest.fn();

export function setFetchRequests(mockFn: any) {
    fetchRequests = mockFn;
}

export let rejectRequest = jest.fn();

export let acceptRequest = jest.fn();

export function setAcceptRequest(mockFn: any) {
    acceptRequest = mockFn;
}

export let setAssetDescription = jest.fn();
