jest.mock('./LegalOfficerContext');
jest.mock('../logion-chain');
jest.mock('./Model');

import { shallowRender } from '../tests';
import PendingTokenizationRequests from './PendingTokenizationRequests';
import { setPendingRequests, setRejectRequest } from './__mocks__/LegalOfficerContextMock';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test("Renders null with no data", () => {
    const tree = shallowRender(<PendingTokenizationRequests />);
    expect(tree).toMatchSnapshot();
});

test("Renders pending requests", () => {
    setPendingRequests([
        {
            id: "1",
            legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            requestedTokenName: "TOKEN1",
            bars: 1,
            status: "PENDING"
        }
    ]);
    const tree = shallowRender(<PendingTokenizationRequests />);
    expect(tree).toMatchSnapshot();
});

test("Click on reject and confirm rejects request", async () => {
    setPendingRequests([
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
    setRejectRequest(rejectCallback);

    render(<PendingTokenizationRequests />);
    const rejectButton = screen.getByTestId("reject-1");
    userEvent.click(rejectButton);

    const reasonText = "Because";
    const reasonTextArea = screen.getByTestId("reason");
    userEvent.type(reasonTextArea, reasonText);

    const confirmButton = screen.getByTestId("confirm-reject-1");
    userEvent.click(confirmButton);

    expect(rejectCallback).toBeCalledWith("1", reasonText);
    await waitFor(() => expect(screen.queryByTestId("modal-reject-1")).not.toBeInTheDocument());
});

test("Click on accept opens acceptance process", () => {
    setPendingRequests([
        {
            id: "1",
            legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            requestedTokenName: "TOKEN1",
            bars: 1,
            status: "PENDING"
        }
    ]);

    const tree = render(<PendingTokenizationRequests />);

    const acceptButton = tree.getByTestId("accept-1");
    userEvent.click(acceptButton);

    const acceptingModal = tree.queryByTestId("modal-accepting-1");
    expect(acceptingModal).toBeInTheDocument();
});
