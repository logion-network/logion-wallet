import { Votes, Vote, VoteData, PendingVote } from "@logion/client";
import { Mock } from "moq.ts";
import { DEFAULT_USER_ACCOUNT } from "src/logion-chain/__mocks__/LogionChainMock";
import { mockSubmittableResult } from "src/logion-chain/__mocks__/SignatureMock";

export function mockVotes(data: VoteData[]): Votes {
    const votes = new Mock<Votes>();
    const votesArray = data.map(data => mockVote(votes.object(), data));
    votes.setup(instance => instance.votes).returns(votesArray);
    votes.setup(instance => instance.findByIdOrThrow).returns(id => votesArray.find(vote => vote.data.voteId === id)!);
    votes.setup(instance => instance.findById).returns(id => votesArray.find(vote => vote.data.voteId === id));
    return votes.object();
}

export function mockVote(votes: Votes, data: VoteData): Vote {
    const vote = Votes.toVote(votes, data);
    if(vote instanceof PendingVote) {
        vote.castVote = params => {
            vote.data.ballots[DEFAULT_USER_ACCOUNT.accountId.address] = params.payload.result;
            params.callback!(mockSubmittableResult(true));
            return Promise.resolve(vote);
        };
    }
    return vote;
}
