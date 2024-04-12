jest.mock('../../common/CommonContext');
jest.mock('../LegalOfficerContext');
jest.mock('../../logion-chain');
jest.mock('../../logion-chain/Signature');
jest.mock('../../loc/Model');
jest.mock("../../loc/LocContext");

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UUID, Fees, ValidAccountId } from '@logion/node-api';
import { LocData } from '@logion/client';

import { shallowRender, typeByLabel } from '../../tests';
import { setCurrentAddress, DEFAULT_LEGAL_OFFICER_ACCOUNT } from '../../logion-chain/__mocks__/LogionChainMock';

import { PendingRequest } from "src/__mocks__/LogionClientMock";
import { mockSubmittableResult } from "src/logion-chain/__mocks__/SignatureMock";
import { setLocState } from "src/loc/__mocks__/LocContextMock";
import { mockSubmittable, setupApiMock } from 'src/__mocks__/LogionMock';
import { It, Mock } from 'moq.ts';
import LocRequestAcceptanceAndCreation from './LocRequestAcceptanceAndCreation';

describe("LocRequestAcceptance", () => {

    it("renders null with no data", () => {
        const tree = shallowRender(<LocRequestAcceptanceAndCreation requestToAccept={null} clearRequestToAccept={jest.fn()} />);
        expect(tree).toMatchSnapshot();
    });

    xit("accepts transaction LOC request", async () => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
        const pendingLoc = new PendingRequest();
        pendingLoc.legalOfficer.accept = async (params: any) => {
            params.callback(mockSubmittableResult(true));
            return params.locState;
        };
        pendingLoc.data = () => ({ locType: "Transaction" });
        setLocState(pendingLoc);

        setupApiMock(api => {
            const submittable = mockSubmittable();
            api.setup(instance => instance.polkadot.tx.logionLoc.createPolkadotTransactionLoc(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny())).returns(submittable.object());
            const fees = new Mock<Fees>();
            api.setup(instance => instance.fees.estimateCreateLoc(It.IsAny())).returnsAsync(fees.object());
        });

        render(<LocRequestAcceptanceAndCreation requestToAccept={REQUEST} clearRequestToAccept={jest.fn()} />);

        // Accept request
        const acceptButton = screen.getByRole('button', {name: 'Proceed'});
        await userEvent.click(acceptButton);

        // Create LOC
        await waitFor(() => screen.getByRole("dialog"));
        await waitFor(() => screen.getByText(/LOC successfully created/));

        const proceedReviewButton = screen.getByRole('button', {name: 'Close'});
        await userEvent.click(proceedReviewButton);
    });

    xit("accepts collection LOC request", async () => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
        const pendingLoc = new PendingRequest();
        pendingLoc.legalOfficer.acceptCollection = async (params: any) => {
            params.callback(mockSubmittableResult(true));
            return params.locState;
        };
        pendingLoc.data = () => ({ locType: "Collection" });
        setLocState(pendingLoc);

        setupApiMock(api => {
            const submittable = mockSubmittable();
            api.setup(instance => instance.polkadot.tx.logionLoc.createCollectionLoc(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny())).returns(submittable.object());
            const fees = new Mock<Fees>();
            api.setup(instance => instance.fees.estimateCreateLoc(It.IsAny())).returnsAsync(fees.object());
        });

        render(<LocRequestAcceptanceAndCreation requestToAccept={COLLECTION_LOC_REQUEST} clearRequestToAccept={jest.fn()} />);

        // Accept request
        const checkBoxes = await screen.findAllByRole("checkbox");
        await userEvent.click(checkBoxes[1]);
        await typeByLabel("Data number limit", "200");
        const acceptButton = screen.getByRole('button', {name: 'Proceed'});
        await userEvent.click(acceptButton);

        // Create LOC
        await waitFor(() => screen.getByRole("dialog"));
        await waitFor(() => screen.getByText(/LOC successfully created/));

        const proceedReviewButton = screen.getByRole('button', {name: 'Close'});
        await userEvent.click(proceedReviewButton);
    });
});

const REQUEST = {
    id: new UUID(),
    ownerAccountId: DEFAULT_LEGAL_OFFICER_ACCOUNT.accountId,
    requesterAccountId: ValidAccountId.polkadot("5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW"),
    description: "LOC description",
    status: "REQUESTED",
    createdOn: "2021-09-20T15:52:00.000",
    files: [],
    links: [],
    locType: 'Transaction',
    metadata: []
} as unknown as LocData;

const COLLECTION_LOC_REQUEST = {
    id: new UUID(),
    ownerAccountId: DEFAULT_LEGAL_OFFICER_ACCOUNT.accountId,
    requesterAccountId: ValidAccountId.polkadot("5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW"),
    description: "LOC description",
    status: "REQUESTED",
    createdOn: "2021-09-20T15:52:00.000",
    files: [],
    links: [],
    locType: 'Collection',
    metadata: []
} as unknown as LocData;
