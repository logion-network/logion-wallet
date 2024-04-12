import { TEST_WALLET_USER } from "src/wallet-user/TestData";
import { shallowRender } from "../tests";
import TransactionType from "./TransactionType";
import { Transaction } from "@logion/client";

describe("TransactionType", () => {

    it("has the right type for a logion pallet/method", () => {
        const transaction = {
            pallet: "logionLoc",
            method: "addCollectionItem",
            type: "EXTRINSIC",
        } as Transaction;
        const result = shallowRender(<TransactionType transaction={ transaction } walletType="Wallet" account={ TEST_WALLET_USER } />);
        expect(result).toMatchSnapshot();
    })

    it("generates a default type pallet/method", () => {
        const transaction = {
            pallet: "unknownPallet",
            method: "unknownMethod",
            type: "EXTRINSIC",
        } as Transaction;
        const result = shallowRender(<TransactionType transaction={ transaction } walletType="Wallet" account={ TEST_WALLET_USER } />);
        expect(result).toMatchSnapshot();
    })
})
