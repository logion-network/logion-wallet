import moment from 'moment';
import { AccountTokens } from "./types/Addresses";

export function storeTokens(tokens: AccountTokens) {
    const storage = getStorage();
    clearTokens();
    for(const address of Object.keys(tokens)) {
        storage.setItem(TOKEN_KEY_PREFIX + address, JSON.stringify(tokens[address]));
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
    const tokens: AccountTokens = {};
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
                    expirationDateTime: moment(storedToken.expirationDateTime),
                }
            } catch(e) {
                console.log(`Unable to parse entry ${key}, skipping`);
            }
        }
    });
    return tokens;
}
