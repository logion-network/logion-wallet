jest.mock('../../common/CommonContext');
jest.mock('../../common/Model');
jest.mock('../../wallet-user/UserContext');

import { shallowRender } from '../../tests';
import RequestedLocs from './RequestedLocs';
import { setPendingLocRequests } from '../../common/__mocks__/CommonContextMock';

it("Renders null with no data", () => {
    const tree = shallowRender(<RequestedLocs />);
    expect(tree).toMatchSnapshot();
});

it("Renders pending requests", () => {
    setPendingLocRequests([
        {
            id: "1",
            ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            description: "LOC description",
            status: "REQUESTED"
        }
    ]);
    const tree = shallowRender(<RequestedLocs/>);
    expect(tree).toMatchSnapshot();
});
