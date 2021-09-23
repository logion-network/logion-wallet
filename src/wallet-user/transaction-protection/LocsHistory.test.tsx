jest.mock('../../common/CommonContext');

import { shallowRender } from '../../tests';
import LocsHistory from './LocsHistory';
import { setLocRequestsHistory } from '../../common/__mocks__/CommonContextMock';

test("Renders null with no data", () => {
    const tree = shallowRender(<LocsHistory />);
    expect(tree).toMatchSnapshot();
});

test("Renders pending requests", () => {
    setLocRequestsHistory([
        {
            id: "1",
            ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            description: "LOC description",
            status: "OPEN"
        }
    ]);
    const tree = shallowRender(<LocsHistory/>);
    expect(tree).toMatchSnapshot();
});
