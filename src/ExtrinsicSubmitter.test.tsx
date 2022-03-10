jest.mock("./logion-chain");

import { setIsSuccessful } from './logion-chain/__mocks__/SignatureMock';
import { mockSubmittableResult } from './logion-chain/__mocks__/SignatureMock';

import { screen, render, waitFor, act } from '@testing-library/react';
import ExtrinsicSubmitter, { SignAndSubmit } from './ExtrinsicSubmitter';
import { SignedTransaction } from './logion-chain/Signature';

test("Submitter empty with null signAndSubmit", () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();
    setIsSuccessful(false);

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

test("Submitter initially showing submitting", async () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();
    setIsSuccessful(false);
    const result = buildSignAndSubmitMock();

    render(<ExtrinsicSubmitter
        id="extrinsicId"
        signAndSubmit={ result.signAndSubmit }
        onSuccess={ onSuccess }
        onError={ onError }
    />);

    await waitFor(() => expect(screen.getByText("Submitting...")).toBeInTheDocument());
    expect(onSuccess).not.toBeCalled();
    expect(onError).not.toBeCalled();
});

interface SignAndSubmitMock {
    signAndSubmit: SignAndSubmit,
    setResult: React.Dispatch<React.SetStateAction<SignedTransaction | null>> | null,
    setError: React.Dispatch<React.SetStateAction<any>> | null,
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

test("Submitter shows error and calls onError", async () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();
    setIsSuccessful(false);
    const result = buildSignAndSubmitMock();

    render(<ExtrinsicSubmitter
        id="extrinsicId"
        signAndSubmit={ result.signAndSubmit }
        onSuccess={ onSuccess }
        onError={ onError }
    />);

    await waitFor(() => expect(result.setError).not.toBeNull());
    act(() => result.setError!("error"));

    await waitFor(() => expect(screen.getByText("Submission failed: error")).toBeInTheDocument());
    expect(onSuccess).not.toBeCalled();
    expect(onError).toBeCalled();
});

test("Submitter shows progress", async () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();
    setIsSuccessful(false);
    const result = buildSignAndSubmitMock();

    render(<ExtrinsicSubmitter
        id="extrinsicId"
        signAndSubmit={ result.signAndSubmit }
        onSuccess={ onSuccess }
        onError={ onError }
    />);

    await waitFor(() => expect(result.setResult).not.toBeNull());
    act(() => result.setResult!(mockSubmittableResult(false)));

    await waitFor(() => expect(screen.getByText("Current status: undefined")).toBeInTheDocument());
    expect(onSuccess).not.toBeCalled();
    expect(onError).not.toBeCalled();
});

test("Submitter shows success and calls onSuccess", async () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();
    const result = buildSignAndSubmitMock();

    render(<ExtrinsicSubmitter
        id="extrinsicId"
        signAndSubmit={ result.signAndSubmit }
        onSuccess={ onSuccess }
        onError={ onError }
    />);

    await waitFor(() => expect(result.setResult).not.toBeNull());
    act(() => result.setResult!(mockSubmittableResult(true)));

    await waitFor(() => expect(screen.getByText("Submission successful.")).toBeInTheDocument());
    expect(onSuccess).toBeCalledWith("extrinsicId", {
        block: "some-hex",
        index: 42
    });
    expect(onError).not.toBeCalled();
});
