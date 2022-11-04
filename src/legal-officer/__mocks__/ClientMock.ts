export let closeLoc = jest.fn().mockResolvedValue(undefined);

export function setCloseLocMock(mock: any) {
    closeLoc = mock;
}
