import { DateTime } from 'luxon';
import { AccountTokens, Token } from '@logion/client';
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
    newSingleStringStorable,
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
        storeMulti(token, address, tokens.get(address))
    }
}

export function clearTokens() {
    clearMulti(token)
}

export function loadTokens(): AccountTokens {
    const tokens: Record<string, Token> = loadMulti(token)
    return new AccountTokens(tokens);
}

const currentAddress: SingleStorable<string> = newSingleStringStorable("currentAddress");

export function storeCurrentAddress(address: string) {
    storeSingle(currentAddress, address)
}

export function clearCurrentAddress() {
    clearSingle(currentAddress);
}

export function loadCurrentAddress(): string | undefined {
    return loadSingle(currentAddress)
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

