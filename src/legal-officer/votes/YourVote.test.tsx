import { UUID } from "@logion/node-api";
import { VoteStatus } from "@logion/client";
import { shallowRender } from "../../tests";
import YourVote from "./YourVote";
import { TEST_WALLET_USER } from "../../wallet-user/TestData";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setVotes } from "../__mocks__/LegalOfficerContextMock";
import { mockVotes } from "./Mocks";

jest.mock("../../logion-chain");
jest.mock("../LegalOfficerContext");

describe("YourVote", () => {

    it("renders buttons if not yet voted", () => {
        const votes = mockVotes([{
            ...PARTIAL_VOTE_DATA,
            ballots: {},
        }]);
        const result = shallowRender(<YourVote vote={votes.findById("1")!}/>);
        expect(result).toMatchSnapshot();
    });

    it("renders result if voted yes", () => {
        const votes = mockVotes([{
            ...PARTIAL_VOTE_DATA,
            ballots: {
                [TEST_WALLET_USER.address]: "Yes",
            },
        }]);
        const result = shallowRender(<YourVote vote={votes.findById("1")!}/>);
        expect(result).toMatchSnapshot();
    });

    it("renders result if voted no", () => {
        const votes = mockVotes([{
            ...PARTIAL_VOTE_DATA,
            ballots: {
                [TEST_WALLET_USER.address]: "No",
            },
        }]);
        const result = shallowRender(<YourVote vote={votes.findById("1")!}/>);
        expect(result).toMatchSnapshot();
    });

    it("calls 'vote' on 'Yes'", async () => {
        const votes = mockVotes([{
            ...PARTIAL_VOTE_DATA,
            ballots: {
                [TEST_WALLET_USER.address]: "Yes",
            },
        }]);
        setVotes(votes);
        render(<YourVote vote={votes.findById("1")!}/>);
        const ok = screen.getByAltText("ok");
        await userEvent.click(ok);
        const okAfterClick = screen.getByAltText("ok");
        expect(okAfterClick).toBeVisible();
    });

    it("calls 'vote' on 'No'", async () => {
        const votes = mockVotes([{
            ...PARTIAL_VOTE_DATA,
            ballots: {
                [TEST_WALLET_USER.address]: "No",
            },
        }]);
        setVotes(votes);
        render(<YourVote vote={votes.findById("1")!}/>);
        const ko = screen.getByAltText("ko");
        await userEvent.click(ko);
        const koAfterClick = screen.getByAltText("ko");
        expect(koAfterClick).toBeVisible();
    });
});

const PARTIAL_VOTE_DATA = {
    voteId: "1",
    createdOn: "",
    locId: new UUID("8691b921-a01d-4f18-a35a-247038b2d7c9"),
    status: "PENDING" as VoteStatus,
    ballots: {},
};
