jest.mock('../../common/CommonContext');
jest.mock('../LegalOfficerContext');
jest.mock('../../logion-chain');
jest.mock('../../logion-chain/Signature');
jest.mock('../../loc/Model');
jest.mock("../../loc/LocContext");

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UUID, LocType, ValidAccountId } from '@logion/node-api';
import { LocData } from '@logion/client';
import { shallowRender } from '../../tests';
import { setCurrentAddress, DEFAULT_LEGAL_OFFICER_ACCOUNT } from '../../logion-chain/__mocks__/LogionChainMock';
import LocRequestAcceptance from './LocRequestAcceptance';
import { PendingRequest } from "src/__mocks__/LogionClientMock";
import { mockSubmittableResult } from "src/logion-chain/__mocks__/SignatureMock";
import { setLocState } from "src/loc/__mocks__/LocContextMock";

describe("LocRequestAcceptance", () => {

    it("renders null with no data", () => {
        const tree = shallowRender(<LocRequestAcceptance requestToAccept={null} clearRequestToAccept={jest.fn()} />);
        expect(tree).toMatchSnapshot();
    });

    it("accepts transaction LOC request", async () => {
        await accepts("Transaction");
    });

    it("accepts collection LOC request", async () => {
        await accepts("Collection");
    });

    async function accepts(locType: LocType){
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
        const pendingLoc = new PendingRequest();
        pendingLoc.legalOfficer.acceptCollection = async (params: any) => {
            params.callback(mockSubmittableResult(true));
            return params.locState;
        };
        pendingLoc.data = () => ({ locType: "Collection" });
        setLocState(pendingLoc);

        const requestToAccept = createRequestToAccept(locType);
        render(<LocRequestAcceptance requestToAccept={ requestToAccept } clearRequestToAccept={jest.fn()} />);

        // Accept request
        const acceptButton = screen.getByRole('button', {name: 'Accept'});
        await userEvent.click(acceptButton);
    }
});

function createRequestToAccept(locType: LocType): LocData {
    return {
        id: new UUID(),
        ownerAddress: DEFAULT_LEGAL_OFFICER_ACCOUNT.accountId.address,
        requesterAccountId: ValidAccountId.polkadot("5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW"),
        description: "LOC description",
        status: "REVIEW_PENDING",
        createdOn: "2021-09-20T15:52:00.000",
        files: [],
        links: [],
        locType,
        metadata: []
    } as unknown as LocData
}
