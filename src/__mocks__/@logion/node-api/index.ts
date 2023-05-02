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
    Currency,
    Numbers,
    Adapters,
} from "@logion/node-api";

export type {
    Coin,
    CoinBalance,
    LogionNodeApiClass,
} from "@logion/node-api";

import { api, mockValidAccountId, mockValidPolkadotAccountId } from "src/__mocks__/LogionMock";

export function validPolkadotAccountId(api: any, address: string) {
    return mockValidPolkadotAccountId(address);
}

export class AnyAccountId {

    constructor(_api: any , address: string, type: "Polkadot" | "Ethereum") {
        this.address = address;
        this.type = type;
    }

    address: string;
    type: "Polkadot" | "Ethereum";

    toValidAccountId() {
        return mockValidAccountId(this.address, this.type);
    }
}

export function buildApiClass() {
    return api.object();
}
