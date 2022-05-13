import { DateTime } from 'luxon';
import { AccountTokens } from '@logion/client/dist/AuthenticationClient';
import { Token } from '@logion/client/dist/Http';
import { LegalOfficer } from '@logion/client/dist/Types';

export function storeTokens(tokens: AccountTokens) {
    const storage = getStorage();
    clearTokens();
    for(const address of tokens.addresses) {
        storage.setItem(TOKEN_KEY_PREFIX + address, JSON.stringify(tokens.get(address)));
    }
}

function getStorage(): Storage {
    return window.localStorage;
}

export function clearTokens() {
    const toRemove: string[] = [];
    forEachStorageKey(key => {
        if(key!.startsWith(TOKEN_KEY_PREFIX)) {
            toRemove.push(key!);
        }
    });

    const storage = getStorage();
    toRemove.forEach(key => storage.removeItem(key));
}

function forEachStorageKey(callback: (key: string) => void) {
    const storage = getStorage();
    for(let i = 0; i < storage.length; ++i) {
        const key = storage.key(i);
        callback(key!);
    }
}

const TOKEN_KEY_PREFIX = "token.";

export function loadTokens(): AccountTokens {
    const tokens: Record<string, Token> = {};
    const storage = getStorage();
    forEachStorageKey(key => {
        if(key.startsWith(TOKEN_KEY_PREFIX)) {
            try {
                const storedToken: {
                    value: string;
                    expirationDateTime: string;
                } = JSON.parse(storage.getItem(key)!);

                tokens[key.substring(TOKEN_KEY_PREFIX.length)] = {
                    value: storedToken.value,
                    expirationDateTime: DateTime.fromISO(storedToken.expirationDateTime),
                }
            } catch(e) {
                console.log(`Unable to parse entry ${key}, skipping`);
            }
        }
    });
    return new AccountTokens(tokens);
}

export function storeCurrentAddress(address: string) {
    const storage = getStorage();
    storage.setItem(CURRENT_ADDRESS_KEY, address);
}

const CURRENT_ADDRESS_KEY = "currentAddress";

export function clearCurrentAddress() {
    const storage = getStorage();
    storage.removeItem(CURRENT_ADDRESS_KEY);
}

export function loadCurrentAddress(): string | null {
    const storage = getStorage();
    return storage.getItem(CURRENT_ADDRESS_KEY);
}

export function storeLegalOfficers(legalOfficers: LegalOfficer[]) {
    const storage = getStorage();
    storage.setItem(LEGAL_OFFICERS_KEY, JSON.stringify(legalOfficers));
}

const LEGAL_OFFICERS_KEY = "legalOfficers";

export function loadLegalOfficers(): LegalOfficer[] {
    const storage = getStorage();
    try {
        const item = storage.getItem(LEGAL_OFFICERS_KEY);
        let legalOfficers: LegalOfficer[];
        if(!item) {
            legalOfficers = [];
        } else {
            legalOfficers = JSON.parse(item);
        }
        return legalOfficers;
    } catch(e) {
        console.log("Unable to read legal officers from storage");
        return [];
    }
}
