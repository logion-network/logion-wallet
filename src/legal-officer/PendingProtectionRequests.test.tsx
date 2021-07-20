jest.mock('./LegalOfficerContext');
jest.mock('../logion-chain');
jest.mock('../logion-chain/Signature');
jest.mock('./Model');

import { shallowRender } from '../tests';
import PendingProtectionRequests from './PendingProtectionRequests';
import { setPendingProtectionRequests } from './__mocks__/LegalOfficerContextMock';
import { setAcceptProtectionRequest, setRejectProtectionRequest } from './__mocks__/ModelMock';
import { ProtectionRequest, DEFAULT_LEGAL_OFFICER } from './Types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ISO_DATETIME_PATTERN } from '../logion-chain/datetime';
import { PENDING_PROTECTION_REQUESTS } from './TestData';

test("Renders null with no data", () => {
    const tree = shallowRender(<PendingProtectionRequests recovery={ false } />);
    expect(tree).toMatchSnapshot();
});

test("Renders pending requests", () => {
    setPendingProtectionRequests(PENDING_PROTECTION_REQUESTS);
    const tree = shallowRender(<PendingProtectionRequests recovery={ false } />);
    expect(tree).toMatchSnapshot();
});

test("Click on later closes dialog", async () => {
    setPendingProtectionRequests(PENDING_PROTECTION_REQUESTS);
    const rejectCallback = jest.fn();
    setRejectProtectionRequest(rejectCallback);
    const acceptCallback = jest.fn();
    setAcceptProtectionRequest(acceptCallback);

    render(<PendingProtectionRequests recovery={ false } />);
    const reviewButton = screen.getByTestId("review-1");
    userEvent.click(reviewButton);

    let laterButton: HTMLElement;
    await waitFor(() => laterButton = screen.getByTestId("later-1"));
    const reviewModal = screen.getByTestId("modal-review-1");
    userEvent.click(laterButton!);

    await waitFor(() => expect(reviewModal).not.toBeInTheDocument());
    expect(rejectCallback).not.toBeCalled();
    expect(acceptCallback).not.toBeCalled();
});

test("Review and reject request", async () => {
    setPendingProtectionRequests(PENDING_PROTECTION_REQUESTS);
    const rejectCallback = jest.fn();
    setRejectProtectionRequest(rejectCallback);
    const acceptCallback = jest.fn();
    setAcceptProtectionRequest(acceptCallback);

    render(<PendingProtectionRequests recovery={ false } />);
    const reviewButton = screen.getByTestId("review-1");
    userEvent.click(reviewButton);

    let rejectButton: HTMLElement;
    await waitFor(() => rejectButton = screen.getByTestId("reject-1"));
    const reviewModal = screen.getByTestId("modal-review-1");
    userEvent.click(rejectButton!);

    await waitFor(() => expect(reviewModal).not.toBeInTheDocument());

    let confirmModal: HTMLElement;
    await waitFor(() => confirmModal = screen.getByTestId("confirm-reject-1"));
    let reasonTextArea = screen.getByTestId("reason");
    const rejectReason = "Reason";
    userEvent.type(reasonTextArea!, rejectReason);
    let confirmButton = screen.getByTestId("confirm-reject-1");
    userEvent.click(confirmButton!);
    await waitFor(() => expect(confirmModal).not.toBeInTheDocument());

    await waitFor(() => expect(rejectCallback).toBeCalledWith(
        expect.objectContaining({
            requestId: "1",
            signature: expect.stringMatching(new RegExp("protection-request,reject," + ISO_DATETIME_PATTERN.source + ",1,")),
            rejectReason,
            signedOn: expect.anything(),
        })
    ));
    expect(acceptCallback).not.toBeCalled();
});

test("Review and accept request", async () => {
    setPendingProtectionRequests(PENDING_PROTECTION_REQUESTS);

    const rejectCallback = jest.fn();
    setRejectProtectionRequest(rejectCallback);
    const acceptCallback = jest.fn();
    setAcceptProtectionRequest(acceptCallback);

    render(<PendingProtectionRequests recovery={ false } />);
    const reviewButton = screen.getByTestId("review-1");
    userEvent.click(reviewButton);

    let acceptButton: HTMLElement;
    await waitFor(() => acceptButton = screen.getByTestId("accept-1"));
    const reviewModal = screen.getByTestId("modal-review-1");
    userEvent.click(acceptButton!);

    await waitFor(() => expect(reviewModal).not.toBeInTheDocument());
    await waitFor(() => expect(acceptCallback).toBeCalledWith(
        expect.objectContaining({
            requestId: "1",
            signature: expect.stringMatching(new RegExp("protection-request,accept," + ISO_DATETIME_PATTERN.source + ",1")),
            signedOn: expect.anything(),
        })
    ));
    expect(rejectCallback).not.toBeCalled();
});
