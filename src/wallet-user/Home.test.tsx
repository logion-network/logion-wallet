jest.mock("react-router");
jest.mock("@logion/node-api/dist/Balances");
jest.mock("../common/CommonContext");

import { DEFAULT_COIN_BALANCE, DEFAULT_TRANSACTION } from "../common/TestData";
import { setBalances, setOpenedLocRequests, setPendingLocRequests, setTransactions } from "../common/__mocks__/CommonContextMock";
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
    const tree = shallowRender(<Home />)
    expect(tree).toMatchSnapshot();
});
