import { render, screen, waitFor } from "@testing-library/react";
import { clickByName } from "src/tests";
import RequestVoteButton from "./RequestVoteButton";
import { mockSubmittableResult } from "src/logion-chain/__mocks__/SignatureMock";
import { ClosedLoc } from "src/__mocks__/@logion/client";
import { setLocState } from "./__mocks__/LocContextMock";
import { FAILED_SUBMISSION, NO_SUBMISSION, SUCCESSFUL_SUBMISSION, setExtrinsicSubmissionState } from "src/logion-chain/__mocks__/LogionChainMock";
import { expectSubmitting } from "src/test/Util";

jest.mock("./LocContext");
jest.mock("../logion-chain");

describe("RequestVoteButton", () => {

    it("submits vote", async () => {
        const locState = new ClosedLoc();
        setLocState(locState);
        locState.legalOfficer.requestVote = async (params: any) => {
            params.callback(mockSubmittableResult(true));
            return VOTE_ID;
        };
        setExtrinsicSubmissionState(NO_SUBMISSION);
        render(<RequestVoteButton />);
        await clickByName((_, element) => /Request a vote/.test(element.textContent || ""));
        await clickByName("Request a vote");
        await waitFor(() => expectSubmitting());
    });

    it("successfully creates a vote", async () => {
        const locState = new ClosedLoc();
        setLocState(locState);
        locState.legalOfficer.requestVote = async (params: any) => {
            params.callback(mockSubmittableResult(true));
            return VOTE_ID;
        };
        setExtrinsicSubmissionState(SUCCESSFUL_SUBMISSION);
        render(<RequestVoteButton />);
        await clickByName((_, element) => /Request a vote/.test(element.textContent || ""));
        const dialog = screen.getByRole("dialog");
        await clickByName("Close");
        await waitFor(() => expect(dialog).not.toBeVisible());
    });

    it("shows error on failure", async () => {
        const locState = new ClosedLoc();
        setLocState(locState);
        locState.legalOfficer.requestVote = async (params: any) => {
            params.callback(mockSubmittableResult(false, "ExtrinsicFailed", true));
            throw new Error();
        };
        setExtrinsicSubmissionState(FAILED_SUBMISSION);
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
