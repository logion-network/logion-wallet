jest.mock('../../common/CommonContext');
jest.mock('../../wallet-user/UserContext');
jest.mock('../../logion-chain');

import { render } from '../../tests';
import OpenedLocs from './OpenedLocs';
import { setOpenedLocRequests } from "../__mocks__/UserContextMock";

describe("OpenedLocs", () => {

    it("Renders null with no data", () => {
        const tree = render(<OpenedLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });

    it("Renders empty list", () => {
        setOpenedLocRequests([]);
        const tree = render(<OpenedLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });

    it("Renders open locs", () => {
        setOpenedLocRequests([
            {
                data: () => {
                    return {
                        id: "6378b339-8f4a-486a-bf5e-6f34b951456a",
                        ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
                        description: "LOC description",
                        status: "OPEN"
                    }
                }
            }
        ]);
        const tree = render(<OpenedLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });
});
