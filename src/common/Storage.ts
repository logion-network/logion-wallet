import { DateTime } from 'luxon';
import { AccountTokens, Token } from '@logion/client';
import { LogionNodeApiClass, ValidAccountId } from "@logion/node-api";
import {
    storeMulti,
    clearMulti,
    loadMulti,
    MultiStorable,
    storeSingle,
    SingleStorable,
    clearSingle,
    loadSingle,
    newSingleJsonStorable,
} from "./GenericStorage";
import { SofParams } from "../loc/statement/SofParams";

const token: MultiStorable<Token> = {
    keyPrefix: "token",
    toValue(obj: Token): string {
        return JSON.stringify(obj);
    },
    fromValue(value: string): Token {
        const storedToken: {
            value: string;
            expirationDateTime: string;
        } = JSON.parse(value);
        return {
            value: storedToken.value,
            expirationDateTime: DateTime.fromISO(storedToken.expirationDateTime),
        }
    }
}

export function storeTokens(tokens: AccountTokens) {
    clearTokens();
    for (const address of tokens.addresses) {
        storeMulti(token, address.toKey(), tokens.get(address))
    }
}

export function clearTokens() {
    clearMulti(token)
}

export function loadTokens(api: LogionNodeApiClass): AccountTokens {
    const tokens: Record<string, Token> = loadMulti(token)
    return new AccountTokens(api, tokens);
}

class CurrentAddressStorable implements SingleStorable<ValidAccountId> {
    key = "currentAddress";

    constructor(api: LogionNodeApiClass) {
        this.api = api;
    }

    private api: LogionNodeApiClass;

    fromValue(value: string) {
        return ValidAccountId.parseKey(this.api.polkadot, value);
    }

    toValue(obj: ValidAccountId): string {
        return obj.toKey();
    }
}

export function storeCurrentAddress(api: LogionNodeApiClass, address: ValidAccountId) {
    storeSingle(new CurrentAddressStorable(api), address)
}

export function clearCurrentAddress(api: LogionNodeApiClass) {
    clearSingle(new CurrentAddressStorable(api));
}

export function loadCurrentAddress(api: LogionNodeApiClass): ValidAccountId | undefined {
    return loadSingle(new CurrentAddressStorable(api));
}

const sofParams: SingleStorable<SofParams> = newSingleJsonStorable<SofParams>("SofParams")

export function storeSofParams(obj: SofParams) {
    storeSingle(sofParams, obj)
}

export function loadSofParams(): SofParams {
    return loadSingle(sofParams)!
}

export function clearSofParams() {
    clearSingle(sofParams)
}

export { clearAll } from "./GenericStorage"

