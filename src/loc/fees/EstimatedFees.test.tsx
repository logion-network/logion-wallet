import { Fees } from "@logion/node-api";
import { shallowRender } from "../../tests";
import EstimatedFees from "./EstimatedFees";

jest.unmock("@logion/client");
jest.unmock("@logion/node-api");

describe("EstimatedFees", () => {

    it("renders fees without storage", () => {
        const fees = new Fees(42n);
        const element = shallowRender(<EstimatedFees fees={ fees } />);
        expect(element).toMatchSnapshot();
    });

    it("renders fees with storage", () => {
        const fees = new Fees(42n, 32n);
        const element = shallowRender(<EstimatedFees fees={ fees } />);
        expect(element).toMatchSnapshot();
    });
});
