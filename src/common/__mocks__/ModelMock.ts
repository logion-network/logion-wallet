export let fetchProtectionRequests = jest.fn();

export function setFetchProtectionRequests(mockFn: any) {
    fetchProtectionRequests = mockFn;
}

export let createLocRequest = jest.fn();
