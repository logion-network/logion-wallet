import { render, screen, waitFor } from "@testing-library/react";
import { clickByName } from "src/tests";
import RequestVoteButton from "./RequestVoteButton";
import { setRequestVoteMock } from "src/legal-officer/__mocks__/ClientMock";
import { mockSubmittableResult } from "src/logion-chain/__mocks__/SignatureMock";
import { ClosedLoc } from "src/__mocks__/@logion/client";
import { setLocState } from "./__mocks__/LocContextMock";
import userEvent from "@testing-library/user-event";

jest.mock("./LocContext");
jest.mock("../legal-officer/client");
jest.mock("../logion-chain");

describe("RequestVoteButton", () => {

    it("successfully creates a vote", async () => {
        const locState = new ClosedLoc();
        setLocState(locState);
        const requestVoteMock = async (params: any) => {
            params.callback(mockSubmittableResult(true));
            return VOTE_ID;
        };
        setRequestVoteMock(requestVoteMock);
        render(<RequestVoteButton />);
        await clickByName((_, element) => /Request a vote/.test(element.textContent || ""));
        await clickByName("Request a vote");
        await waitFor(() => screen.getByText("42"));
        const dialog = screen.getByRole("dialog");
        await clickByName("Close");
        await waitFor(() => expect(dialog).not.toBeVisible());
    });

    it("shows error on failure", async () => {
        const locState = new ClosedLoc();
        setLocState(locState);
        const requestVoteMock = async (params: any) => {
            params.callback(mockSubmittableResult(true, "ExtrinsicFailed", true));
            throw new Error();
        };
        setRequestVoteMock(requestVoteMock);
        render(<RequestVoteButton />);
        await clickByName((_, element) => /Request a vote/.test(element.textContent || ""));
        await clickByName("Request a vote");
        await waitFor(() => screen.getByText(/Submission failed/));
        const dialog = screen.getByRole("dialog");
        await clickByName("Close");
        await waitFor(() => expect(dialog).not.toBeVisible());
    });
});

const VOTE_ID = "42";
