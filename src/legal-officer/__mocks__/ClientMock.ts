export let closeLoc = jest.fn().mockResolvedValue(undefined);

export function setCloseLocMock(mock: any) {
    closeLoc = mock;
}

export let deleteLink = jest.fn().mockResolvedValue(undefined);
