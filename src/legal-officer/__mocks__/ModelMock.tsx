export let rejectRequest = jest.fn();

export let acceptRequest = jest.fn();

export function setAcceptRequest(mockFn: any) {
    acceptRequest = mockFn;
}

export let setAssetDescription = jest.fn();

export let rejectProtectionRequest = jest.fn();

export function setRejectProtectionRequest(mockFn: any) {
    rejectProtectionRequest = mockFn;
}

export let acceptProtectionRequest = jest.fn();

export function setAcceptProtectionRequest(mockFn: any) {
    acceptProtectionRequest = mockFn;
}

export function decision(legalOfficerAddress: string, decisions: any[]) {
    return decisions[0];
}

export let fetchRecoveryInfo = jest.fn();

export function setFetchRecoveryInfo(mockFn: any) {
    fetchRecoveryInfo = mockFn;
}

export let acceptLocRequest = jest.fn();

export function setAcceptLocRequest(mockFn: any) {
    acceptLocRequest = mockFn;
}

export let rejectLocRequest = jest.fn();

export function setRejectLocRequest(mockFn: any) {
    rejectLocRequest = mockFn;
}
