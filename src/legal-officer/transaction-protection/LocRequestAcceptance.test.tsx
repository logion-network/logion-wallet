jest.mock('../../common/CommonContext');
jest.mock('../LegalOfficerContext');
jest.mock('../../logion-chain');
jest.mock('@logion/node-api/dist/LogionLoc');
jest.mock('../../logion-chain/Signature');
jest.mock('../../loc/Model');

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UUID } from '@logion/node-api/dist/UUID';
import { LocRequest } from '@logion/client';

import { shallowRender, typeByLabel } from '../../tests';
import { finalizeSubmission } from '../../logion-chain/__mocks__/SignatureMock';
import { setCurrentAddress, DEFAULT_LEGAL_OFFICER_ACCOUNT, axiosMock } from '../../logion-chain/__mocks__/LogionChainMock';

import { setAcceptLocRequest, acceptLocRequest } from '../../loc/__mocks__/ModelMock';

import LocRequestAcceptance from './LocRequestAcceptance';

describe("LocRequestAcceptance", () => {

    it("Renders null with no data", () => {
        const tree = shallowRender(<LocRequestAcceptance requestToAccept={null} clearRequestToAccept={jest.fn()} />);
        expect(tree).toMatchSnapshot();
    });

    const REQUEST: LocRequest = {
        id: new UUID().toString(),
        ownerAddress: DEFAULT_LEGAL_OFFICER_ACCOUNT.address,
        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
        description: "LOC description",
        status: "REQUESTED",
        createdOn: "2021-09-20T15:52:00.000",
        files: [],
        links: [],
        locType: 'Transaction',
        metadata: []
    };

    it("Click on accept and proceed accepts transaction LOC request", async () => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
        render(<LocRequestAcceptance requestToAccept={REQUEST} clearRequestToAccept={jest.fn()} />);

        // Accept request
        setAcceptLocRequest(jest.fn().mockResolvedValue({}));
        const acceptButton = screen.getByRole('button', {name: 'Proceed'});
        await userEvent.click(acceptButton);

        // Create LOC
        await waitFor(() => screen.getByRole("dialog"));
        await waitFor(() => screen.getByText(/Submitting/));
        finalizeSubmission();
        await waitFor(() => screen.getByText(/LOC successfully created/));
        await waitFor(() => expect(acceptLocRequest).toBeCalledWith(
            axiosMock.object(),
            expect.objectContaining({
                requestId: REQUEST.id
            })
        ));

        const proceedReviewButton = screen.getByRole('button', {name: 'Close'});
        await userEvent.click(proceedReviewButton);
    });

    it("Click on accept and proceed accepts collection LOC request", async () => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
        render(<LocRequestAcceptance requestToAccept={COLLECTION_LOC_REQUEST} clearRequestToAccept={jest.fn()} />);

        // Accept request
        setAcceptLocRequest(jest.fn().mockResolvedValue({}));
        const checkBoxes = await screen.findAllByRole("checkbox");
        await userEvent.click(checkBoxes[1]);
        await typeByLabel("Data number limit", "200");
        const acceptButton = screen.getByRole('button', {name: 'Proceed'});
        await userEvent.click(acceptButton);

        // Create LOC
        await waitFor(() => screen.getByRole("dialog"));
        await waitFor(() => screen.getByText(/Submitting/));
        finalizeSubmission();
        await waitFor(() => screen.getByText(/LOC successfully created/));
        await waitFor(() => expect(acceptLocRequest).toBeCalledWith(
            axiosMock.object(),
            expect.objectContaining({
                requestId: COLLECTION_LOC_REQUEST.id
            })
        ));

        const proceedReviewButton = screen.getByRole('button', {name: 'Close'});
        await userEvent.click(proceedReviewButton);
    });

    const COLLECTION_LOC_REQUEST: LocRequest = {
        id: new UUID().toString(),
        ownerAddress: DEFAULT_LEGAL_OFFICER_ACCOUNT.address,
        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
        description: "LOC description",
        status: "REQUESTED",
        createdOn: "2021-09-20T15:52:00.000",
        files: [],
        links: [],
        locType: 'Collection',
        metadata: []
    };
});
