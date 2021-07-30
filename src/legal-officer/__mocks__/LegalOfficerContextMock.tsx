export let pendingTokenizationRequests: any[] | null = null;

export let rejectRequest = () => {

};

export let tokenizationRequestsHistory: any[] | null = null;

export let refreshRequests = jest.fn();

export let pendingProtectionRequests: any[] | null = null;

export let activatedProtectionRequests: any[] | null = null;

export let protectionRequestsHistory: any[] | null = null;

export let recoveryRequestsHistory: any[] | null = null;

export function setPendingRequests(requests: any[]) {
    pendingTokenizationRequests = requests;
}

export function setRejectRequest(callback: any) {
    rejectRequest = callback;
}

export function setTokenizationRequestsHistory(requests: any[]) {
    tokenizationRequestsHistory = requests;
}

export function setRefreshRequests(callback: any) {
    refreshRequests = callback;
}

export function setPendingProtectionRequests(requests: any[]) {
    pendingProtectionRequests = requests;
}

export function setActivatedProtectionRequests(requests: any[]) {
    activatedProtectionRequests = requests;
}

export function setProtectionRequestsHistory(requests: any[]) {
    protectionRequestsHistory = requests;
}

export function setRecoveryRequestsHistory(requests: any[]) {
    recoveryRequestsHistory = requests;
}
