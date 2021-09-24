jest.mock('../../common/CommonContext');

import { shallowRender } from '../../tests';
import { setRejectedLocRequests } from '../../common/__mocks__/CommonContextMock';

import RejectedLocRequests from './RejectedLocRequests';

test("Renders null with no data", () => {
    const tree = shallowRender(<RejectedLocRequests />);
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
    const tree = shallowRender(<RejectedLocRequests />);
    expect(tree).toMatchSnapshot();
});
