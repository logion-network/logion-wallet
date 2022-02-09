jest.mock('../../common/CommonContext');
jest.mock('../../common/Model');
jest.mock('../../wallet-user/UserContext');
jest.mock('../../directory/DirectoryContext');

import { render } from '../../tests';
import RequestedLocs from './RequestedLocs';
import { setPendingLocRequests } from '../../common/__mocks__/CommonContextMock';

it("Renders null with no data", () => {
    const tree = render(<RequestedLocs locType="Transaction" />);
    expect(tree).toMatchSnapshot();
});

it("Renders pending requests", () => {
    setPendingLocRequests([
        {
            id: "6378b339-8f4a-486a-bf5e-6f34b951456a",
            ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            description: "LOC description",
            status: "REQUESTED"
        }
    ]);
    const tree = render(<RequestedLocs locType="Transaction" />);
    expect(tree).toMatchSnapshot();
});
