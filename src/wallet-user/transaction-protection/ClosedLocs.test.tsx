jest.mock('../../common/CommonContext');

import { shallowRender } from '../../tests';
import ClosedLocs from './ClosedLocs';
import { setClosedLocRequests } from '../../common/__mocks__/CommonContextMock';

test("Renders null with no data", () => {
    const tree = shallowRender(<ClosedLocs />);
    expect(tree).toMatchSnapshot();
});

test("Renders pending requests", () => {
    setClosedLocRequests([
        {
            request: {
                id: "1",
                ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
                description: "LOC description",
                status: "CLOSED"
            }
        }
    ]);
    const tree = shallowRender(<ClosedLocs/>);
    expect(tree).toMatchSnapshot();
});
