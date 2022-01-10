export let fetchRecoveryInfo = jest.fn();

export function setFetchRecoveryInfo(mockFn: any) {
    fetchRecoveryInfo = mockFn;
}
