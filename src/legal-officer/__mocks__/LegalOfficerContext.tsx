export let pendingTokenizationRequests: any[] | null = null;

export let rejectRequest = () => {

};

export let acceptedTokenizationRequests: any[] | null = null;

export let rejectedTokenizationRequests: any[] | null = null;

export let refreshRequests = () => {

};

export let pendingProtectionRequests: any[] | null = null;

export let acceptedProtectionRequests: any[] | null = null;

export let protectionRequestsHistory: any[] | null = null;

export function useLegalOfficerContext() {
    return {
        pendingTokenizationRequests,
        rejectRequest,
        rejectedTokenizationRequests,
        acceptedTokenizationRequests,
        refreshRequests,
        pendingProtectionRequests,
        acceptedProtectionRequests,
        protectionRequestsHistory,
    };
}

export function setPendingRequests(requests: any[]) {
    pendingTokenizationRequests = requests;
}

export function setRejectRequest(callback: any) {
    rejectRequest = callback;
}

export function setRejectedRequests(requests: any[]) {
    rejectedTokenizationRequests = requests;
}

export function setAcceptedRequests(requests: any[]) {
    acceptedTokenizationRequests = requests;
}

export function setRefreshRequests(callback: any) {
    refreshRequests = callback;
}

export function setPendingProtectionRequests(requests: any[]) {
    pendingProtectionRequests = requests;
}

export function setAcceptedProtectionRequests(requests: any[]) {
    acceptedProtectionRequests = requests;
}

export function setProtectionRequestsHistory(requests: any[]) {
    protectionRequestsHistory = requests;
}
