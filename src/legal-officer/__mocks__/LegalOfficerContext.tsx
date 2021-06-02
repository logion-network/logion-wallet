export let pendingTokenizationRequests: any[] | null = null;

export let rejectRequest = () => {
    
};

export let acceptedTokenizationRequests: any[] | null = null;

export let rejectedTokenizationRequests: any[] | null = null;

export let refreshRequests = () => {
    
};

export function useLegalOfficerContext() {
    return {
        pendingTokenizationRequests,
        rejectRequest,
        rejectedTokenizationRequests,
        acceptedTokenizationRequests,
        refreshRequests,
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
