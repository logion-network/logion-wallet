jest.mock('./UserContext');

import { shallowRender } from '../tests';
import RejectedTokenizationRequests from './RejectedTokenizationRequests';
import { setRejectedRequests } from './UserContext';

test("Renders null with no data", () => {
    const tree = shallowRender(<RejectedTokenizationRequests />);
    expect(tree).toMatchSnapshot();
});

test("Renders pending requests", () => {
    setRejectedRequests([
        {
            id: "1",
            legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            requestedTokenName: "TOKEN1",
            bars: 1,
            status: "REJECTED"
        }
    ]);
    const tree = shallowRender(<RejectedTokenizationRequests />);
    expect(tree).toMatchSnapshot();
});
