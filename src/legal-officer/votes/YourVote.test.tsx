import { UUID } from "@logion/node-api";
import { shallowRender } from "../../tests";
import { Vote, VoteResult } from "../client";
import YourVote from "./YourVote";
import { TEST_WALLET_USER } from "../../wallet-user/TestData";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../../logion-chain");
jest.mock("../LegalOfficerContext");

describe("YourVote", () => {

    it("renders buttons if not yet voted", () => {
        const vote = buildVote({});
        const result = shallowRender(<YourVote vote={vote}/>);
        expect(result).toMatchSnapshot();
    });

    it("renders result if voted yes", () => {
        const vote = buildVote({
            [TEST_WALLET_USER]: "Yes",
        });
        const result = shallowRender(<YourVote vote={vote}/>);
        expect(result).toMatchSnapshot();
    });

    it("renders result if voted no", () => {
        const vote = buildVote({
            [TEST_WALLET_USER]: "No",
        });
        const result = shallowRender(<YourVote vote={vote}/>);
        expect(result).toMatchSnapshot();
    });

    it("calls 'vote' on 'Yes'", async () => {
        const vote = buildVote({});
        render(<YourVote vote={vote}/>);
        const ok = screen.getByAltText("ok");
        await userEvent.click(ok);
        const okAfterClick = screen.getByAltText("ok");
        expect(okAfterClick).toBeVisible();
        const koAfterClick = screen.getByAltText("ko");
        expect(koAfterClick).toBeVisible();
    });

    it("calls 'vote' on 'No'", async () => {
        const vote = buildVote({});
        render(<YourVote vote={vote}/>);
        const ko = screen.getByAltText("ko");
        await userEvent.click(ko);
        const okAfterClick = screen.getByAltText("ok");
        expect(okAfterClick).toBeVisible();
        const koAfterClick = screen.getByAltText("ko");
        expect(koAfterClick).toBeVisible();
    });
});

function buildVote(ballots: { [key: string]: (VoteResult | undefined) }): Vote {
    return {
        voteId: "1",
        createdOn: "",
        locId: new UUID("8691b921-a01d-4f18-a35a-247038b2d7c9"),
        status: "PENDING",
        ballots,
    };
}
