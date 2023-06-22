export let requestVote = jest.fn().mockResolvedValue(undefined);

export function setRequestVoteMock(mock: any) {
    requestVote = mock;
}
