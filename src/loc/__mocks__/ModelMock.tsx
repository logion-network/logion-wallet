export let rejectProtectionRequest = jest.fn();

export function setRejectProtectionRequest(mockFn: any) {
    rejectProtectionRequest = mockFn;
}

export let acceptProtectionRequest = jest.fn();

export function setAcceptProtectionRequest(mockFn: any) {
    acceptProtectionRequest = mockFn;
}
