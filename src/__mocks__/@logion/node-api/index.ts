export {
    UUID,
    PrefixedNumber,
    SYMBOL,
    ATTO,
    MILLI,
    NONE,
    getCoin,
    asString,
    getCollectionSize,
} from "@logion/node-api";
export type {
    Coin,
    CoinBalance,
} from "@logion/node-api";

export function buildApi() {
    return new ApiPromise();
}

export * from "./dist/Accounts";
export * from "./dist/Balances";
export * from "./dist/Codec";
export * from "./dist/LogionLoc";
export * from "./dist/Recovery";
import { ApiPromise } from "src/__mocks__/PolkadotApiMock";
