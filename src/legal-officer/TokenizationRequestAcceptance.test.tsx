jest.mock('../common/CommonContext');
jest.mock('./LegalOfficerContext');
jest.mock('../logion-chain');
jest.mock('../logion-chain/Assets');
jest.mock('../logion-chain/Signature');
jest.mock('./Model');

import { shallowRender } from '../tests';
import TokenizationRequestAcceptance from './TokenizationRequestAcceptance';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { finalizeSubmission } from '../logion-chain/__mocks__/SignatureMock';
import { setAcceptRequest, acceptRequest, setAssetDescription } from './__mocks__/ModelMock';
import { TokenizationRequest } from '../common/types/ModelTypes';
import { setCurrentAddress, DEFAULT_LEGAL_OFFICER_ACCOUNT, axiosMock } from '../common/__mocks__/CommonContextMock';

describe("TokenizationRequestAcceptance", () => {

    it("Renders null with no data", () => {
        const tree = shallowRender(<TokenizationRequestAcceptance requestToAccept={null} clearRequestToAccept={jest.fn()} />);
        expect(tree).toMatchSnapshot();
    });

    const REQUEST: TokenizationRequest = {
        id: "1",
        legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
        requestedTokenName: "TOKEN1",
        bars: 1,
        status: "PENDING",
    };

    it("Click on accept and proceed accepts request", async () => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
        render(<TokenizationRequestAcceptance requestToAccept={REQUEST} clearRequestToAccept={jest.fn()} />);

        // Accept request
        setAcceptRequest(jest.fn().mockResolvedValue({
            sessionToken: "token"
        }));
        const acceptButton = screen.getByTestId("proceed-accept-1");
        userEvent.click(acceptButton);
        await waitFor(() => expect(acceptRequest).toBeCalledWith(
            axiosMock.object(),
            expect.objectContaining({
                requestId: "1",
            })
        ));

        // Create asset
        await waitFor(() => screen.getByTestId("modal-accepted-1"));
        const createButton = screen.getByTestId("proceed-create-1");
        userEvent.click(createButton);
        await waitFor(() => screen.getByText(/Submitting/));
        act(finalizeSubmission);
        await waitFor(() => screen.getByText(/Asset successfully created/));
        await waitFor(() => expect(setAssetDescription).toBeCalledWith(
            axiosMock.object(),
            expect.objectContaining({
                requestId: "1",
                description: {
                    assetId: "assetId",
                    decimals: 18
                },
            })
        ));

        // Set metadata
        const proceedMetadataButton = screen.getByTestId("proceed-metadata-1");
        userEvent.click(proceedMetadataButton);
        await waitFor(() => screen.getByText(/Submitting/));
        act(finalizeSubmission);
        await waitFor(() => screen.getByText(/Metadata successfully set/));

        // Mint tokens result
        const proceedMintingButton = screen.getByTestId("proceed-minting-1");
        userEvent.click(proceedMintingButton);
        await waitFor(() => screen.getByText(/Submitting/));
        act(finalizeSubmission);
        await waitFor(() => screen.getByText(/Tokens successfully minted/));

        const proceedReviewButton = screen.getByTestId("proceed-review-1");
        userEvent.click(proceedReviewButton);

        const closeReviewButton = await screen.findByTestId("close-review-1");
        userEvent.click(closeReviewButton);
    });
});
