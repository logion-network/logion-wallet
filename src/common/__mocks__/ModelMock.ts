export let fetchRequests = jest.fn();

export function setFetchRequests(mockFn: any) {
    fetchRequests = mockFn;
}

export let fetchProtectionRequests = jest.fn();

export function setFetchProtectionRequests(mockFn: any) {
    fetchProtectionRequests = mockFn;
}
