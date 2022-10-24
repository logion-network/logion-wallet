jest.mock('../LegalOfficerContext');

import { LocData, RejectedRequest } from '@logion/client';
import { UUID } from '@logion/node-api';
import { shallowRender } from '../../tests';
import { setRejectedLocRequests } from "../__mocks__/LegalOfficerContextMock";

import RejectedLocRequests from './RejectedLocRequests';

test("Renders null with no data", () => {
    const tree = shallowRender(<RejectedLocRequests locType="Transaction" />);
    expect(tree).toMatchSnapshot();
});

test("Renders rejected requests", () => {
    setRejectedLocRequests([
        {
            data: () => ({
                id: new UUID("556f4128-4fc3-4fdc-a543-74e6230911c4"),
                legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
                requestedTokenName: "TOKEN1",
                bars: 1,
                status: "REJECTED",
            } as unknown as LocData)
        } as RejectedRequest
    ]);
    const tree = shallowRender(<RejectedLocRequests locType="Transaction" />);
    expect(tree).toMatchSnapshot();
});
