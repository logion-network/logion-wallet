import { ISubmittableResult } from "@logion/client";
import { screen, render, waitFor } from '@testing-library/react';

import ExtrinsicSubmitter, { SignAndSubmit } from './ExtrinsicSubmitter';
import { expectSubmitting } from "./test/Util";
import { FAILED_SUBMISSION, NO_SUBMISSION, PENDING_SUBMISSION, SUCCESSFUL_SUBMISSION, setExtrinsicSubmissionState } from "./logion-chain/__mocks__/LogionChainMock";

jest.mock("./logion-chain");

describe("ExtrinsicSubmitter", () => {

    it("is empty with null signAndSubmit", () => {
        const onSuccess = jest.fn();
        const onError = jest.fn();
    
        render(<ExtrinsicSubmitter
            id="extrinsicId"
            signAndSubmit={ null }
            onSuccess={ onSuccess }
            onError={ onError }
        />);
    
        expect(screen.getByRole('generic')).toBeEmptyDOMElement();
        expect(onSuccess).not.toBeCalled();
        expect(onError).not.toBeCalled();
    });

    it("is initially showing submitting", async () => {
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const result = buildSignAndSubmitMock();
    
        setExtrinsicSubmissionState(NO_SUBMISSION);
        render(<ExtrinsicSubmitter
            id="extrinsicId"
            signAndSubmit={ result.signAndSubmit }
            onSuccess={ onSuccess }
            onError={ onError }
        />);
    
        await waitFor(() => expectSubmitting());
        expect(onSuccess).not.toBeCalled();
        expect(onError).not.toBeCalled();
    });

    it("shows error and calls onError", async () => {
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const result = buildSignAndSubmitMock();

        setExtrinsicSubmissionState(FAILED_SUBMISSION);
        render(<ExtrinsicSubmitter
            id="extrinsicId"
            signAndSubmit={ result.signAndSubmit }
            onSuccess={ onSuccess }
            onError={ onError }
        />);

        await waitFor(() => expect(screen.getByText("Submission failed: error")).toBeInTheDocument());
        expect(onSuccess).not.toBeCalled();
        expect(onError).toBeCalled();
    });

    it("shows progress", async () => {
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const result = buildSignAndSubmitMock();

        setExtrinsicSubmissionState(PENDING_SUBMISSION);
        render(<ExtrinsicSubmitter
            id="extrinsicId"
            signAndSubmit={ result.signAndSubmit }
            onSuccess={ onSuccess }
            onError={ onError }
        />);
    
        await waitFor(() => expect(screen.getByText("Current status: undefined")).toBeInTheDocument());
        expect(onSuccess).not.toBeCalled();
        expect(onError).not.toBeCalled();
    });

    it("shows success and calls onSuccess", async () => {
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const result = buildSignAndSubmitMock();
    
        setExtrinsicSubmissionState(SUCCESSFUL_SUBMISSION);
        render(<ExtrinsicSubmitter
            id="extrinsicId"
            signAndSubmit={ result.signAndSubmit }
            onSuccess={ onSuccess }
            onError={ onError }
        />);
    
        await waitFor(() => expect(screen.getByText("Submission successful.")).toBeInTheDocument());
        expect(onSuccess).toBeCalledWith("extrinsicId");
        expect(onError).not.toBeCalled();
    });
});

interface SignAndSubmitMock {
    signAndSubmit: SignAndSubmit,
    setResult: ((result: ISubmittableResult | null) => void) | null,
    setError: ((error: unknown) => void) | null,
}

function buildSignAndSubmitMock(): SignAndSubmitMock {
    const result: SignAndSubmitMock = {
        signAndSubmit: null,
        setResult: null,
        setError: null,
    };
    result.signAndSubmit = (setResult, setError) => {
        result.setResult = setResult;
        result.setError = setError;
        return Promise.resolve(() => {});
    }
    return result;
}
