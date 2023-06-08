jest.mock('../../common/CommonContext');
jest.mock('../../common/Model');
jest.mock('../../wallet-user/UserContext');
jest.mock('../../logion-chain');

import { render } from '../../tests';
import DraftLocs from './DraftLocs';
import { setDraftLocRequests } from "../__mocks__/UserContextMock";

describe("DraftLocs", () => {

    it("renders null with no data", () => {
        const tree = render(<DraftLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });

    it("renders empty list", () => {
        setDraftLocRequests([]);
        const tree = render(<DraftLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });

    it("renders pending requests", () => {
        setDraftLocRequests([
            {
                data: () => {
                    return {
                        id: "6378b339-8f4a-486a-bf5e-6f34b951456a",
                        ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
                        description: "LOC description",
                        status: "REVIEW_PENDING"
                    }
                }
            }
        ]);
        const tree = render(<DraftLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });
});
