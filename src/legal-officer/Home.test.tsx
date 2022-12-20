jest.mock("react-router");
jest.mock("../common/CommonContext");
jest.mock("@logion/node-api/dist/Balances.js");
jest.mock("../logion-chain");
jest.mock('./LegalOfficerContext');

import { LocData, OpenLoc, PendingRequest } from "@logion/client";
import { BalanceState } from "@logion/client/dist/Balance.js";
import { DEFAULT_COIN_BALANCE, DEFAULT_TRANSACTION } from "../common/TestData";
import { setBalanceState, } from "../common/__mocks__/CommonContextMock";
import {
    setOpenedLocRequests,
    setPendingLocRequests,
    setOpenedIdentityLocs
} from "./__mocks__/LegalOfficerContextMock";
import { shallowRender } from "../tests";
import Home from "./Home";
import { UUID } from "@logion/node-api";

test("renders", () => {
    setBalanceState({
        balances: [ DEFAULT_COIN_BALANCE ],
        transactions: [ DEFAULT_TRANSACTION ],
    } as BalanceState);
    setOpenedLocRequests([
        {
            data: () => ({
                id: new UUID("556f4128-4fc3-4fdc-a543-74e6230911c4"),
                ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
                description: "LOC description",
                status: "OPEN"
            } as LocData)
        } as OpenLoc
    ]);
    setPendingLocRequests([
        {
            data: () => ({
            id: new UUID("556f4128-4fc3-4fdc-a543-74e6230911c4"),
            ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            description: "LOC description",
            status: "REQUESTED"
            } as LocData)
        } as PendingRequest
    ]);
    setOpenedIdentityLocs([])
    const tree = shallowRender(<Home />)
    expect(tree).toMatchSnapshot();
});
