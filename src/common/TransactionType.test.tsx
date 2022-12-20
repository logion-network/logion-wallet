import { shallowRender } from "../tests";
import TransactionType from "./TransactionType";
import { Transaction } from "@logion/client/dist/TransactionClient.js";

describe("TransactionType", () => {

    it("has the right type for a logion pallet/method", () => {
        const transaction = {
            pallet: "logionLoc",
            method: "addCollectionItem"
        } as Transaction;
        const result = shallowRender(<TransactionType transaction={ transaction } walletType="Wallet" address="" />);
        expect(result).toMatchSnapshot();
    })

    it("generates a default type pallet/method", () => {
        const transaction = {
            pallet: "unknownPallet",
            method: "unknownMethod"
        } as Transaction;
        const result = shallowRender(<TransactionType transaction={ transaction } walletType="Wallet" address="" />);
        expect(result).toMatchSnapshot();
    })
})
