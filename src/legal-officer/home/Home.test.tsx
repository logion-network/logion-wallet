jest.mock("react-router");
jest.mock("../../common/CommonContext");
jest.mock("../../logion-chain");
jest.mock('../LegalOfficerContext');

import { BalanceState } from "@logion/client/dist/Balance.js";
import { DEFAULT_COIN_BALANCE, DEFAULT_TRANSACTION } from "../../common/TestData";
import { setBalanceState, } from "../../common/__mocks__/CommonContextMock";
import { shallowRender } from "../../tests";
import Home from "./Home";

describe("Home", () => {

    it("renders", () => {
        setBalanceState({
            balance: DEFAULT_COIN_BALANCE,
            transactions: [ DEFAULT_TRANSACTION ],
        } as BalanceState);
        const tree = shallowRender(<Home />)
        expect(tree).toMatchSnapshot();
    });
});
