jest.mock('../LegalOfficerContext');

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
            id: "1",
            legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            requestedTokenName: "TOKEN1",
            bars: 1,
            status: "REJECTED"
        }
    ]);
    const tree = shallowRender(<RejectedLocRequests locType="Transaction" />);
    expect(tree).toMatchSnapshot();
});
