import { setOpenVerifiedThirdPartyLocs } from "../__mocks__/UserContextMock";
import { render } from "../../tests";
import VTPOpenedLocs from "./VTPOpenedLocs";

jest.mock('../../common/CommonContext');
jest.mock('../../wallet-user/UserContext');
jest.mock('../../logion-chain');

describe("VTPOpenedLocs", () => {
    it("renders open VTP LOCS", async () => {
        setOpenVerifiedThirdPartyLocs(
            [
                {
                    data: () => {
                        return {
                            id: "6378b339-8f4a-486a-bf5e-6f34b951456a",
                            ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
                            description: "TRANSACTION description",
                            status: "OPEN",
                            locType: "Transaction",
                            createdOn: "18/11/2022 17:17"
                        }
                    }
                }
            ],
            [
                {
                    data: () => {
                        return {
                            id: "6378b339-8f4a-486a-bf5e-6f34b951456a",
                            ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
                            description: "COLLECTION description",
                            status: "OPEN",
                            locType: "Collection",
                            createdOn: "18/11/2022 17:17"
                        }
                    }
                }
            ],
        );
        const tree = render(<VTPOpenedLocs />);
        expect(tree).toMatchSnapshot();
    })
})
