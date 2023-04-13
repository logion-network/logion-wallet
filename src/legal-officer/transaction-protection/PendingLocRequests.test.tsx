jest.mock('../LegalOfficerContext');

import { PendingRequest, LocData } from "@logion/client";
import { UUID } from "@logion/node-api";

import { shallowRender } from '../../tests';

import { setCurrentAddress, DEFAULT_LEGAL_OFFICER_ACCOUNT } from '../../logion-chain/__mocks__/LogionChainMock';
import { setPendingLocRequests } from "../__mocks__/LegalOfficerContextMock";

import PendingLocRequests from './PendingLocRequests';
import { mockValidPolkadotAccountId } from "../../__mocks__/@logion/node-api/Mocks";

describe("PendingLocRequests", () => {

    beforeEach(() => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
    });

    it("renders null with no data", () => {
        const tree = shallowRender(<PendingLocRequests locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });

    it("renders pending requests", () => {
        setPendingLocRequests([
            {
                data: () => ({
                    id: new UUID(REQUEST_ID),
                    ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                    requesterAddress: mockValidPolkadotAccountId("5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW"),
                    status: "REQUESTED"
                } as LocData)
            } as PendingRequest
        ]);
        const tree = shallowRender(<PendingLocRequests locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });
})

const REQUEST_ID = "556f4128-4fc3-4fdc-a543-74e6230911c4";
