jest.mock('../../logion-chain');
jest.mock('../../common/CommonContext');
jest.mock('../LegalOfficerContext');
jest.mock('../../loc/Model');

import { render, screen, waitFor, getByText } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { shallowRender } from '../../tests';

import { axiosMock, setCurrentAddress, DEFAULT_LEGAL_OFFICER_ACCOUNT } from '../../logion-chain/__mocks__/LogionChainMock';
import { setPendingLocRequests } from '../../common/__mocks__/CommonContextMock';

import { setRejectLocRequest } from '../../loc/__mocks__/ModelMock';

import PendingLocRequests from './PendingLocRequests';

beforeEach(() => {
    setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
});

test("Renders null with no data", () => {
    const tree = shallowRender(<PendingLocRequests locType="Transaction" />);
    expect(tree).toMatchSnapshot();
});

test("Renders pending requests", () => {
    setPendingLocRequests([
        {
            id: "1",
            ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            status: "REQUESTED"
        }
    ]);
    const tree = shallowRender(<PendingLocRequests locType="Transaction" />);
    expect(tree).toMatchSnapshot();
});

test("Click on reject and confirm rejects request", async () => {
    setPendingLocRequests([
        {
            id: "1",
            ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            status: "REQUESTED"
        }
    ]);
    const rejectCallback = jest.fn();
    setRejectLocRequest(rejectCallback);

    render(<PendingLocRequests locType="Transaction" />);
    const rejectButton = screen.getByTestId("reject-1");
    await userEvent.click(rejectButton);

    const reasonText = "Because";
    const reasonTextArea = screen.getByTestId("reason");
    await userEvent.type(reasonTextArea, reasonText);

    const confirmButton = screen.getByRole("button", {name: "Proceed"});
    await userEvent.click(confirmButton);

    expect(rejectCallback).toBeCalledWith(
        axiosMock.object(),
        expect.objectContaining({
            requestId: "1",
            rejectReason: reasonText

        })
    );
    await waitFor(() => expect(screen.queryByTestId("modal-reject-1")).not.toBeInTheDocument());
});

test("Click on accept opens acceptance process", async () => {
    setPendingLocRequests([
        {
            id: "1",
            legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            requestedTokenName: "TOKEN1",
            bars: 1,
            status: "PENDING",
            locType: "Transaction"
        }
    ]);

    const tree = render(<PendingLocRequests locType="Transaction" />);

    const acceptButton = tree.getByTestId("accept-1");
    await userEvent.click(acceptButton);

    const acceptingModal = tree.getByRole('dialog');
    expect(getByText(acceptingModal, "Accepting Transaction Protection Request")).toBeInTheDocument();
    expect(acceptingModal).toBeInTheDocument();
});
