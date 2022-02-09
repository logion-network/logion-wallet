jest.mock('../../common/CommonContext');
jest.mock('../../directory/DirectoryContext');

import { render } from '../../tests';
import OpenedLocs from './OpenedLocs';
import { setOpenedLocRequests } from '../../common/__mocks__/CommonContextMock';

test("Renders null with no data", () => {
    const tree = render(<OpenedLocs locType="Transaction" />);
    expect(tree).toMatchSnapshot();
});

test("Renders pending requests", () => {
    setOpenedLocRequests([
        {
            request: {
                id: "6378b339-8f4a-486a-bf5e-6f34b951456a",
                ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
                description: "LOC description",
                status: "OPEN"
            }
        }
    ]);
    const tree = render(<OpenedLocs locType="Transaction" />);
    expect(tree).toMatchSnapshot();
});
