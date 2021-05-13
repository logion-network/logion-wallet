export let pendingTokenizationRequests: any[] | null = null;

export let rejectRequest = () => {
    
};

export function useLegalOfficerContext() {
    return {
        pendingTokenizationRequests,
        rejectRequest
    };
}

export function setPendingRequests(requests: any[]) {
    pendingTokenizationRequests = requests;
}

export function setRejectRequest(callback: any) {
    rejectRequest = callback;
}
