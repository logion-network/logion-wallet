interface Storable<T> {
    toValue(obj: T): string;
    fromValue(value: string): T;
}

const jsonStorable: Storable<any> = {
    toValue(obj: any): string {
        return JSON.stringify(obj, null, 2);
    },
    fromValue(value: string): any {
        return JSON.parse(value);
    },
}

const stringStorable: Storable<string> = {
    fromValue(value: string): string {
        return value
    },
    toValue(obj: string): string {
        return obj
    }
}

export interface SingleStorable<T> extends Storable<T> {
    readonly key: string;
}

export interface MultiStorable<T> extends Storable<T> {
    readonly keyPrefix: string;
}

export function newSingleStringStorable(key: string): SingleStorable<string> {
    return {
        key,
        ...stringStorable
    }
}

export function newMultiStringStorable(keyPrefix: string): MultiStorable<string> {
    return {
        keyPrefix,
        ...stringStorable
    }
}

export function newSingleJsonStorable<T>(key: string): SingleStorable<T> {
    return {
        key,
        ...jsonStorable
    }
}

export function newMultiJsonStorable<T>(keyPrefix: string): MultiStorable<T> {
    return {
        keyPrefix,
        ...jsonStorable
    }
}

export function storeMulti<T>(storable: MultiStorable<T>, key: string, obj: T) {
    const storage = getStorage();
    const value = storable.toValue(obj);
    console.log("Storing %s%s\n%s", keyPrefix(storable), key, value)
    storage.setItem(keyPrefix(storable) + key, value)
}

export function clearMulti<T>(storable: MultiStorable<T>) {
    const toRemove: string[] = [];
    forEachStorageKey(key => {
        if(key.startsWith(keyPrefix(storable))) {
            toRemove.push(key!);
        }
    });
    const storage = getStorage();
    toRemove.forEach(key => storage.removeItem(key));
}

export function loadMulti<T>(storable: MultiStorable<T>): Record<string, T> {
    const objects: Record<string, T> = {};
    const storage = getStorage();
    forEachStorageKey(key => {
        if(key.startsWith(keyPrefix(storable))) {
            try {
                const value = storage.getItem(key);
                objects[key.substring(keyPrefix(storable).length)] = storable.fromValue(value!)
            } catch(e) {
                console.log(`Unable to parse entry ${key}, skipping`);
            }
        }
    });
    return objects
}

export function storeSingle<T>(storable: SingleStorable<T>, obj: T) {
    const storage = getStorage();
    storage.setItem(storable.key, storable.toValue(obj));
}

export function clearSingle<T>(storable: SingleStorable<T>) {
    const storage = getStorage();
    storage.removeItem(storable.key);
}

export function loadSingle<T>(storable: SingleStorable<T>): T | undefined {
    const storage = getStorage();
    const value = storage.getItem(storable.key);
    if (value) {
        return storable.fromValue(value);
    } else {
        return undefined;
    }
}

export function clearAll() {
    getStorage().clear();
}

function forEachStorageKey(callback: (key: string) => void) {
    const storage = getStorage();
    for(let i = 0; i < storage.length; ++i) {
        const key = storage.key(i);
        callback(key!);
    }
}

function getStorage(): Storage {
    return window.localStorage;
}

function keyPrefix<T>(storable: MultiStorable<T>): string {
    return storable.keyPrefix + ".";
}

