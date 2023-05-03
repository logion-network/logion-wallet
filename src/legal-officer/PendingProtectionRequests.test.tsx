jest.mock('../logion-chain/Signature');
jest.mock('./LegalOfficerContext');
jest.mock('../logion-chain');
jest.mock('../loc/Model');
jest.mock('../common/CommonContext');

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { shallowRender } from '../tests';
import PendingProtectionRequests from './PendingProtectionRequests';
import { setPendingProtectionRequests, setPendingRecoveryRequests } from './__mocks__/LegalOfficerContextMock';
import { setAcceptProtectionRequest, setRejectProtectionRequest } from '../loc/__mocks__/ModelMock';
import { PENDING_PROTECTION_REQUESTS } from './TestData';
import { setCurrentAddress, DEFAULT_LEGAL_OFFICER_ACCOUNT, axiosMock } from '../logion-chain/__mocks__/LogionChainMock';
import { setupQueriesGetLegalOfficerCase } from 'src/test/Util';
import { UUID } from '@logion/node-api';
import { setupApiMock, CLOSED_IDENTITY_LOC, CLOSED_IDENTITY_LOC_ID } from 'src/__mocks__/LogionMock';

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
        setPendingRecoveryRequests([]);
        const tree = shallowRender(<PendingProtectionRequests recovery={ false } />);
        expect(tree).toMatchSnapshot();
    });

    it("Click on later closes dialog", async () => {
        setPendingProtectionRequests(PENDING_PROTECTION_REQUESTS);
        setPendingRecoveryRequests([]);
        const rejectCallback = jest.fn();
        setRejectProtectionRequest(rejectCallback);
        const acceptCallback = jest.fn();
        setAcceptProtectionRequest(acceptCallback);

        render(<PendingProtectionRequests recovery={ false } />);
        const reviewButton = screen.getByRole("button", {name: "Review and proceed"});
        await userEvent.click(reviewButton);

        let laterButton: HTMLElement;
        await waitFor(() => laterButton = screen.getByRole("button", {name: "Later"}));
        const reviewModal = screen.getByRole("dialog");
        await userEvent.click(laterButton!);

        await waitFor(() => expect(reviewModal).not.toBeInTheDocument());
        expect(rejectCallback).not.toBeCalled();
        expect(acceptCallback).not.toBeCalled();
    });

    it("Review and reject request", async () => {
        setPendingProtectionRequests(PENDING_PROTECTION_REQUESTS);
        setPendingRecoveryRequests([]);
        const rejectCallback = jest.fn();
        setRejectProtectionRequest(rejectCallback);
        const acceptCallback = jest.fn();
        setAcceptProtectionRequest(acceptCallback);

        render(<PendingProtectionRequests recovery={ false } />);
        const reviewButton = screen.getByRole("button", {name: "Review and proceed"});
        await userEvent.click(reviewButton);

        let rejectButton: HTMLElement;
        await waitFor(() => rejectButton = screen.getByRole('button', {name: "No"}));
        const reviewModal = screen.getByRole("dialog");
        await userEvent.click(rejectButton!);

        await waitFor(() => expect(reviewModal).not.toBeInTheDocument());

        let confirmModal: HTMLElement;
        await waitFor(() => confirmModal = screen.getByRole("dialog"));
        let reasonTextArea = screen.getByRole("textbox", {name: "Reason"});
        const rejectReason = "Reason";
        await userEvent.type(reasonTextArea!, rejectReason);
        let confirmButton = screen.getByRole('button', {name: "Confirm"});
        await userEvent.click(confirmButton!);
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
        setPendingRecoveryRequests([]);
        setupApiMock(api => {
            setupQueriesGetLegalOfficerCase(api, UUID.fromDecimalStringOrThrow(CLOSED_IDENTITY_LOC_ID), CLOSED_IDENTITY_LOC);
        });

        const rejectCallback = jest.fn();
        setRejectProtectionRequest(rejectCallback);
        const acceptCallback = jest.fn();
        setAcceptProtectionRequest(acceptCallback);

        render(<PendingProtectionRequests recovery={ false } />);
        const reviewButton = screen.getByRole("button", {name: "Review and proceed"});
        await userEvent.click(reviewButton);

        let acceptButton: HTMLElement;
        await waitFor(() => acceptButton = screen.getByRole("button", {name: "Yes"}));
        const reviewModal = screen.getByRole("dialog");
        await userEvent.click(acceptButton!);

        let linkButton: HTMLElement;
        await waitFor(() => linkButton = screen.getByRole("button", {name: "Link to an existing Identity LOC"}));
        await userEvent.click(linkButton!);

        await waitFor(() => expect(reviewModal).not.toBeInTheDocument());

        let closedLocInput: HTMLElement;
        await waitFor(() => closedLocInput = screen.getByRole("textbox", {name: "Closed Identity LOC ID"}));
        await userEvent.type(closedLocInput!, CLOSED_IDENTITY_LOC_ID);

        let confirmButton: HTMLElement;
        await waitFor(() => confirmButton = screen.getByRole("button", {name: "Confirm"}));
        await userEvent.click(confirmButton!);

        await waitFor(() => expect(acceptCallback).toBeCalledWith(
            axiosMock.object(),
            expect.objectContaining({
                requestId: "1",
            })
        ));
        expect(rejectCallback).not.toBeCalled();
    });
});
