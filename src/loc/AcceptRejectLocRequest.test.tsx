import { LocData } from "@logion/client";
import { UUID } from "@logion/node-api";
import { getByText, render, screen, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event';

import { axiosMock, setCurrentAddress, DEFAULT_LEGAL_OFFICER_ACCOUNT } from '../logion-chain/__mocks__/LogionChainMock';
import { shallowRender } from "../tests";
import AcceptRejectLocRequest from "./AcceptRejectLocRequest";
import "./AcceptRejectLocRequest.tsx";
import { setRejectLocRequest } from "./__mocks__/ModelMock";
import { mockValidPolkadotAccountId } from 'src/__mocks__/LogionMock';

jest.mock("../logion-chain");
jest.mock('./Model');
jest.mock("./LocContext");

describe("AcceptRejectLocRequest", () => {

    beforeEach(() => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
    });

    it("Renders pending requests", () => {
        const tree = shallowRender(<AcceptRejectLocRequest loc={{
            id: new UUID(REQUEST_ID),
            ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: mockValidPolkadotAccountId("5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW"),
            status: "REQUESTED"
        } as LocData} rejectPath="/" />);
        expect(tree).toMatchSnapshot();
    });

    it("Click on reject and confirm rejects request", async () => {
        const rejectCallback = jest.fn();
        setRejectLocRequest(rejectCallback);

        render(<AcceptRejectLocRequest loc={{
            id: new UUID(REQUEST_ID),
            ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: mockValidPolkadotAccountId("5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW"),
            status: "REQUESTED"
        } as LocData} rejectPath="/" />);
        const rejectButton = screen.getByTestId(`reject-${REQUEST_ID}`);
        await userEvent.click(rejectButton);

        const reasonText = "Because";
        const reasonTextArea = screen.getByTestId("reason");
        await userEvent.type(reasonTextArea, reasonText);

        const confirmButton = screen.getByRole("button", {name: "Proceed"});
        await userEvent.click(confirmButton);

        expect(rejectCallback).toBeCalledWith(
            axiosMock.object(),
            expect.objectContaining({
                requestId: REQUEST_ID,
                rejectReason: reasonText

            })
        );
        await waitFor(() => expect(screen.queryByTestId(`modal-reject-${REQUEST_ID}`)).not.toBeInTheDocument());
    });

    it("Click on accept opens acceptance process", async () => {
        const tree = render(<AcceptRejectLocRequest loc={{
            id: new UUID(REQUEST_ID),
            legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            requestedTokenName: "TOKEN1",
            bars: 1,
            status: "PENDING",
            locType: "Transaction"
        } as unknown as LocData} rejectPath="/" />);

        const acceptButton = tree.getByTestId(`accept-${REQUEST_ID}`);
        await userEvent.click(acceptButton);

        const acceptingModal = tree.getByRole('dialog');
        expect(getByText(acceptingModal, "Accepting Transaction Protection Request")).toBeInTheDocument();
        expect(acceptingModal).toBeInTheDocument();
    });
});

const REQUEST_ID = "556f4128-4fc3-4fdc-a543-74e6230911c4";
