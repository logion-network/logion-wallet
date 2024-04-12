import { shallowRender } from "src/tests";
import LegalFeeAmount from "./LegalFeeAmount";
import { LocData } from "@logion/client";
import { Lgnt } from "@logion/node-api";
import { TEST_WALLET_USER } from "src/wallet-user/TestData";

describe("LegalFeeAmount", () => {

    it("renders for Logion identity requester", () => {
        const loc = {
            
        } as unknown as LocData;
        const element = shallowRender(<LegalFeeAmount loc={ loc } />);
        expect(element).toMatchSnapshot();
    });

    it("renders default for Polkadot requester", () => {
        const loc = {
            requesterAccountId: TEST_WALLET_USER,
            fees: {

            },
        } as unknown as LocData;
        const element = shallowRender(<LegalFeeAmount loc={ loc } />);
        expect(element).toMatchSnapshot();
    });

    it("renders custom for Polkadot requester", () => {
        const loc = {
            requesterAccountId: TEST_WALLET_USER,
            fees: {
                legalFee: Lgnt.from(200n),
            },
        } as unknown as LocData;
        const element = shallowRender(<LegalFeeAmount loc={ loc } />);
        expect(element).toMatchSnapshot();
    });
});
