jest.mock('../../common/CommonContext');
jest.mock('../../wallet-user/UserContext');
jest.mock('../../logion-chain');

import { render } from '../../tests';
import RejectedLocs from './RejectedLocs';
import { setRejectedLocRequests } from "../__mocks__/UserContextMock";

describe("RejectedLocs", () => {

    it("Renders null with no data", () => {
        const tree = render(<RejectedLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });

    it("Renders empty list", () => {
        setRejectedLocRequests([]);
        const tree = render(<RejectedLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });

    it("Renders rejected requests", () => {
        setRejectedLocRequests([
            {
                data: () => {
                    return {
                        id: "1",
                        ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
                        description: "LOC description",
                        status: "OPEN"
                    }
                }
            }
        ]);
        const tree = render(<RejectedLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });
});
