export {
    UUID,
    Currency,
    Numbers,
    Adapters,
    Queries,
    LogionNodeApiClass,
    Fees,
} from "@logion/node-api";

export type {
    Coin,
    CoinBalance,
} from "@logion/node-api";

import { api } from "src/__mocks__/LogionMock";

export function buildApiClass() {
    return api.object();
}
