jest.mock('../../common/CommonContext');
jest.mock('../../logion-chain');

import { render } from '../../tests';
import RejectedLocs from './RejectedLocs';
import { setRejectedLocRequests } from '../../common/__mocks__/CommonContextMock';

test("Renders null with no data", () => {
    const tree = render(<RejectedLocs locType="Transaction" />);
    expect(tree).toMatchSnapshot();
});

test("Renders pending requests", () => {
    setRejectedLocRequests([
        {
            id: "1",
            ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            description: "LOC description",
            status: "OPEN"
        }
    ]);
    const tree = render(<RejectedLocs locType="Transaction" />);
    expect(tree).toMatchSnapshot();
});
