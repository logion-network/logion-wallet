jest.mock('./UserContext');

import { shallowRender } from '../tests';
import PendingTokenizationRequests from './PendingTokenizationRequests';
import { setPendingRequests } from './__mocks__/UserContextMock';

test("Renders null with no data", () => {
    const tree = shallowRender(<PendingTokenizationRequests />);
    expect(tree).toMatchSnapshot();
});

test("Renders pending requests", () => {
    setPendingRequests([
        {
            id: "1",
            legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            requestedTokenName: "TOKEN1",
            bars: 1,
            status: "PENDING"
        }
    ]);
    const tree = shallowRender(<PendingTokenizationRequests />);
    expect(tree).toMatchSnapshot();
});
