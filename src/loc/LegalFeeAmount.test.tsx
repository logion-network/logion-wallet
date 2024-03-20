import { shallowRender } from "src/tests";
import LegalFeeAmount from "./LegalFeeAmount";
import { LocData } from "@logion/client";
import { Lgnt } from "@logion/node-api";

describe("LegalFeeAmount", () => {

    it("renders for Logion identity requester", () => {
        const loc = {
            requesterAddress: undefined,
        } as unknown as LocData;
        const element = shallowRender(<LegalFeeAmount loc={ loc } />);
        expect(element).toMatchSnapshot();
    });

    it("renders default for Polkadot requester", () => {
        const loc = {
            requesterAddress: {},
            fees: {

            },
        } as unknown as LocData;
        const element = shallowRender(<LegalFeeAmount loc={ loc } />);
        expect(element).toMatchSnapshot();
    });

    it("renders custom for Polkadot requester", () => {
        const loc = {
            requesterAddress: {},
            fees: {
                legalFee: Lgnt.from(200n),
            },
        } as unknown as LocData;
        const element = shallowRender(<LegalFeeAmount loc={ loc } />);
        expect(element).toMatchSnapshot();
    });
});
