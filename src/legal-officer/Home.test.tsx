jest.mock("react-router");
jest.mock("../common/CommonContext");
jest.mock("@logion/node-api/dist/Balances");

import { DEFAULT_COIN_BALANCE, DEFAULT_TRANSACTION } from "../common/TestData";
import {
    setBalances,
    setOpenedLocRequests,
    setPendingLocRequests,
    setTransactions,
    setOpenedIdentityLocs
} from "../common/__mocks__/CommonContextMock";
import { shallowRender } from "../tests";
import Home from "./Home";

test("renders", () => {
    setBalances([ DEFAULT_COIN_BALANCE ]);
    setTransactions([ DEFAULT_TRANSACTION ]);
    setOpenedLocRequests([
        {
            id: "1",
            ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            description: "LOC description",
            status: "OPEN"
        }
    ]);
    setPendingLocRequests([
        {
            id: "1",
            ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            description: "LOC description",
            status: "REQUESTED"
        }
    ]);
    setOpenedIdentityLocs([])
    const tree = shallowRender(<Home />)
    expect(tree).toMatchSnapshot();
});
