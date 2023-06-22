import { Fees } from "@logion/node-api";
import { shallowRender } from "../../tests";
import EstimatedFees from "./EstimatedFees";

jest.unmock("@logion/client");
jest.unmock("@logion/node-api");

describe("EstimatedFees", () => {

    it("renders fees without storage", () => {
        const fees = new Fees({ inclusionFee: 42n });
        const element = shallowRender(<EstimatedFees fees={ fees } />);
        expect(element).toMatchSnapshot();
    });

    it("renders fees with storage", () => {
        const fees = new Fees({
            inclusionFee: 42n,
            storageFee: 32n
        });
        const element = shallowRender(<EstimatedFees fees={ fees } />);
        expect(element).toMatchSnapshot();
    });

    it("renders fees with storage and paid by", () => {
        const fees = new Fees({
            inclusionFee: 42n,
            storageFee: 32n
        });
        const element = shallowRender(<EstimatedFees
            fees={ fees }
            inclusionFeePaidBy="paid by the Legal Officer"
            otherFeesPaidBy="paid by the requester"
        />);
        expect(element).toMatchSnapshot();
    });

    it("renders fees with legal", () => {
        const fees = new Fees({
            inclusionFee: 42n,
            legalFee: 22n,
        });
        const element = shallowRender(<EstimatedFees fees={ fees } />);
        expect(element).toMatchSnapshot();
    });

    it("renders fees with certificate", () => {
        const fees = new Fees({
            inclusionFee: 42n,
            certificateFee: 22n,
        });
        const element = shallowRender(<EstimatedFees fees={ fees } />);
        expect(element).toMatchSnapshot();
    });
});
