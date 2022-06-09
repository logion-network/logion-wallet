jest.mock("react-router");
jest.mock("../common/CommonContext");
jest.mock("@logion/node-api/dist/Balances");
jest.mock("../logion-chain");

import { BalanceState } from "@logion/client/dist/Balance";
import { DEFAULT_COIN_BALANCE, DEFAULT_TRANSACTION } from "../common/TestData";
import { setBalanceState, } from "../common/__mocks__/CommonContextMock";
import {
    setOpenedLocRequests,
    setPendingLocRequests,
    setOpenedIdentityLocs
} from "./__mocks__/LegalOfficerContextMock";
import { shallowRender } from "../tests";
import Home from "./Home";

test("renders", () => {
    setBalanceState({
        balances: [ DEFAULT_COIN_BALANCE ],
        transactions: [ DEFAULT_TRANSACTION ],
    } as BalanceState);
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
