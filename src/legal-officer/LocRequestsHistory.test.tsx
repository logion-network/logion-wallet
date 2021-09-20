jest.mock('../common/CommonContext');

import { shallowRender } from '../tests';
import LocRequestsHistory from './LocRequestsHistory';
import { setLocRequestsHistory } from '../common/__mocks__/CommonContextMock';

test("Renders null with no data", () => {
    const tree = shallowRender(<LocRequestsHistory />);
    expect(tree).toMatchSnapshot();
});

test("Renders accepted requests", () => {
    setLocRequestsHistory([
        {
            id: "1",
            legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            requestedTokenName: "TOKEN1",
            bars: 1,
            status: "REJECTED"
        }
    ]);
    const tree = shallowRender(<LocRequestsHistory />);
    expect(tree).toMatchSnapshot();
});
