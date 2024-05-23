export let fetchRecoveryInfo = jest.fn();

export function setFetchRecoveryInfo(mockFn: any) {
    fetchRecoveryInfo = mockFn;
}

export let rejectAccountRecoveryRequest = jest.fn();

export function setRejectAccountRecoveryRequest(mockFn: any) {
    rejectAccountRecoveryRequest = mockFn;
}

export let acceptAccountRecoveryRequest = jest.fn();

export function setAcceptAccountRecoveryRequest(mockFn: any) {
    acceptAccountRecoveryRequest = mockFn;
}
