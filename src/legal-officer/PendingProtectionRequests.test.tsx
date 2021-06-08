jest.mock('./LegalOfficerContext');
jest.mock('../logion-chain');
jest.mock('./Model');

import { shallowRender } from '../tests';
import PendingProtectionRequests from './PendingProtectionRequests';
import { setPendingProtectionRequests } from './LegalOfficerContext';
import { setAcceptProtectionRequest, setRejectProtectionRequest } from './Model';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ISO_DATETIME_PATTERN } from '../logion-chain/datetime';

test("Renders null with no data", () => {
    const tree = shallowRender(<PendingProtectionRequests />);
    expect(tree).toMatchSnapshot();
});

test("Renders pending requests", () => {
    setPendingProtectionRequests([
        {
            id: "1",
        }
    ]);
    const tree = shallowRender(<PendingProtectionRequests />);
    expect(tree).toMatchSnapshot();
});

test("Click on later closes dialog", async () => {
    setPendingProtectionRequests([
        {
            id: "1",
        }
    ]);
    const rejectCallback = jest.fn();
    setRejectProtectionRequest(rejectCallback);
    const acceptCallback = jest.fn();
    setAcceptProtectionRequest(acceptCallback);

    render(<PendingProtectionRequests />);
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
    setPendingProtectionRequests([
        {
            id: "1",
        }
    ]);
    const rejectCallback = jest.fn();
    setRejectProtectionRequest(rejectCallback);
    const acceptCallback = jest.fn();
    setAcceptProtectionRequest(acceptCallback);

    render(<PendingProtectionRequests />);
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
    setPendingProtectionRequests([
        {
            id: "1",
            legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            requestedTokenName: "TOKEN1",
            bars: 1,
            status: "PENDING"
        }
    ]);

    const rejectCallback = jest.fn();
    setRejectProtectionRequest(rejectCallback);
    const acceptCallback = jest.fn();
    setAcceptProtectionRequest(acceptCallback);

    render(<PendingProtectionRequests />);
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
