jest.mock('../../common/CommonContext');
jest.mock('../../wallet-user/UserContext');
jest.mock('../../logion-chain');

import { render } from '../../tests';
import ClosedLocs from './ClosedLocs';
import { setClosedLocRequests } from "../__mocks__/UserContextMock";

describe("ClosedLocs", () => {

    it("Renders null with no data", () => {
        const tree = render(<ClosedLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });

    it("Renders empty list", () => {
        setClosedLocRequests([]);
        const tree = render(<ClosedLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });

    it("Renders pending requests", () => {
        setClosedLocRequests([
            {
                data: () => {
                    return {
                        id: "6378b339-8f4a-486a-bf5e-6f34b951456a",
                        ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
                        description: "LOC description",
                        status: "CLOSED"
                    }
                }
            }
        ]);
        const tree = render(<ClosedLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });
});
