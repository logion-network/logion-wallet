export let pendingTokenizationRequests: any[] | null = null;

export let rejectRequest = () => {
    
};

export let rejectedTokenizationRequests: any[] | null = null;

export function useLegalOfficerContext() {
    return {
        pendingTokenizationRequests,
        rejectRequest,
        rejectedTokenizationRequests,
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
