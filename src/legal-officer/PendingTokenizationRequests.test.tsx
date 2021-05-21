jest.mock('./LegalOfficerContext');

import { shallowRender } from '../tests';
import PendingTokenizationRequests from './PendingTokenizationRequests';
import { setPendingRequests, setRejectRequest } from './LegalOfficerContext';
import { render, act, fireEvent } from '@testing-library/react';

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

test("Click on reject and confirm rejects request", () => {
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

    const tree = render(<PendingTokenizationRequests />);
    const rejectButton = tree.getByTestId("reject-1");
    act(() => { fireEvent.click(rejectButton) });

    const reasonText = "Because";
    const reasonTextArea = tree.getByTestId("reason");
    act(() => { fireEvent.change(reasonTextArea, {target: {value: reasonText}}) });

    const confirmButton = tree.getByTestId("confirm-reject-1");
    act(() => { fireEvent.click(confirmButton) });

    expect(rejectCallback).toBeCalledWith("1", reasonText);
});
