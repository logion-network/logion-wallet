jest.mock('./LegalOfficerContext');
jest.mock('../logion-chain');
jest.mock('../logion-chain/LogionLoc');
jest.mock('../logion-chain/Signature');
jest.mock('./Model');
jest.mock('../common/CommonContext');

import { shallowRender } from '../tests';
import PendingProtectionRequests from './PendingProtectionRequests';
import { setPendingProtectionRequests } from './__mocks__/LegalOfficerContextMock';
import { setAcceptProtectionRequest, setRejectProtectionRequest } from './__mocks__/ModelMock';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PENDING_PROTECTION_REQUESTS } from './TestData';
import { setCurrentAddress, DEFAULT_LEGAL_OFFICER_ACCOUNT, axiosMock } from '../common/__mocks__/CommonContextMock';
import { CLOSED_IDENTITY_LOC_ID } from '../logion-chain/__mocks__/LogionLocMock';

describe("PendingProtectionRequests", () => {

    beforeEach(() => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
    });

    it("Renders null with no data", () => {
        const tree = shallowRender(<PendingProtectionRequests recovery={ false } />);
        expect(tree).toMatchSnapshot();
    });

    it("Renders pending requests", () => {
        setPendingProtectionRequests(PENDING_PROTECTION_REQUESTS);
        const tree = shallowRender(<PendingProtectionRequests recovery={ false } />);
        expect(tree).toMatchSnapshot();
    });

    it("Click on later closes dialog", async () => {
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

    it("Review and reject request", async () => {
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
            axiosMock.object(),
            expect.objectContaining({
                requestId: "1",
                rejectReason,
            })
        ));
        expect(acceptCallback).not.toBeCalled();
    });

    it("Review and accept request", async () => {
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

        let closedLocInput: HTMLElement;
        await waitFor(() => closedLocInput = screen.getByRole("textbox", {name: "Closed Identity LOC ID"}));
        userEvent.type(closedLocInput!, CLOSED_IDENTITY_LOC_ID);

        let confirmButton: HTMLElement;
        await waitFor(() => confirmButton = screen.getByRole("button", {name: "Confirm"}));
        userEvent.click(confirmButton!);

        await waitFor(() => expect(acceptCallback).toBeCalledWith(
            axiosMock.object(),
            expect.objectContaining({
                requestId: "1",
            })
        ));
        expect(rejectCallback).not.toBeCalled();
    });
});
