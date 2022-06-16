jest.mock('../../common/CommonContext');
jest.mock('../../wallet-user/UserContext');
jest.mock('../../logion-chain');

import { render } from '../../tests';
import VoidLocs from "./VoidLocs";
import { setVoidedLocs } from "../__mocks__/UserContextMock";

describe("VoidLocs", () => {

    it("Renders null with no data", () => {
        const tree = render(<VoidLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });

    it("Renders empty list", () => {
        setVoidedLocs([]);
        const tree = render(<VoidLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });

    it("Renders void locs", () => {
        setVoidedLocs([
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
        const tree = render(<VoidLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });
});
