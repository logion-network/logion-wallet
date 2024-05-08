export {
    UUID,
    Currency,
    Numbers,
    Adapters,
    Queries,
    LogionNodeApiClass,
    Fees,
    Hash,
    Lgnt,
    LgntFormatter,
    ValidAccountId,
    AnyAccountId,
} from "@logion/node-api";

export type {
    TypesAccountData,
} from "@logion/node-api";

import { api } from "src/__mocks__/LogionMock";

export function buildApiClass() {
    return api.object();
}
