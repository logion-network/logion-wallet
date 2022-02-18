import moment, { Moment } from 'moment';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

export interface Token {
    readonly value: string;
    readonly expirationDateTime: Moment;
}

export interface Account {
    readonly name: string,
    readonly address: string,
    readonly isLegalOfficer: boolean,
    readonly token?: Token,
}

export default interface Accounts {
    readonly all: Account[],
    readonly current?: Account,
}

export class AccountTokens {

    constructor(initialState: Record<string, Token>) {
        this.store = { ...initialState };
    }

    private store: Record<string, Token>;

    get(address: string): Token | undefined {
        return this.store[address];
    }

    merge(tokens: AccountTokens): AccountTokens {
        const newStore = { ...this.store };
        for(const address of tokens.addresses) {
            newStore[address] = tokens.store[address];
        }
        return new AccountTokens(newStore);
    }

    get addresses(): string[] {
        return Object.keys(this.store);
    }

    cleanUp(now: Moment): AccountTokens {
        const newStore: Record<string, Token> = {};
        for(const address of this.addresses) {
            const token = this.get(address)!;
            if(token.expirationDateTime.isAfter(now)) {
                newStore[address] = token;
            }
        }
        return new AccountTokens(newStore);
    }

    equals(other: AccountTokens): boolean {
        if(this.length !== other.length) {
            return false;
        }
        for(const address of this.addresses) {
            const thisToken = this.get(address);
            const otherToken = other.get(address);
            if(thisToken!.value !== otherToken?.value
                || !thisToken!.expirationDateTime.isSame(otherToken.expirationDateTime)) {
                return false;
            }
        }
        return true;
    }

    get length(): number {
        return this.addresses.length;
    }

    isAuthenticated(now: Moment, address: string | undefined): boolean {
        if(address === undefined) {
            return false;
        }
        const token = this.get(address);
        if(token === undefined) {
            return false;
        } else {
            return token.expirationDateTime.isAfter(now);
        }
    }

    earliestExpiration(): Moment | undefined {
        let earliest: Moment | undefined;
        for(const address of this.addresses) {
            const expiration = this.store[address].expirationDateTime;
            if(earliest === undefined || earliest.isAfter(expiration)) {
                earliest = expiration;
            }
        }
        return earliest;
    }
}

export function buildAccounts(
    injectedAccounts: InjectedAccountWithMeta[],
    userAddress: string | undefined,
    tokens: AccountTokens,
    isLegalOfficer: (address: string) => boolean,
): Accounts {
    const selectedAddress = currentOrDefaultAddress(injectedAccounts, userAddress, tokens);

    let current: Account | undefined;
    const matchingAddress = injectedAccounts.find(injectedAccount => injectedAccount.address === selectedAddress);
    if(selectedAddress !== undefined && matchingAddress !== undefined) {
        current = {
            name: matchingAddress.meta.name!,
            address: selectedAddress!,
            isLegalOfficer: isLegalOfficer(selectedAddress),
            token: tokenOrUndefinedIfExpired(tokens.get(selectedAddress)),
        }
    } else {
        current = undefined;
    }

    return {
        current,
        all: injectedAccounts.map(injectedAccount => ({
            name: injectedAccount.meta.name!,
            address: injectedAccount.address,
            isLegalOfficer: isLegalOfficer(injectedAccount.address),
            token: tokenOrUndefinedIfExpired(tokens.get(injectedAccount.address)),
        }))
    }
}

function currentOrDefaultAddress(
    injectedAccounts: InjectedAccountWithMeta[],
    currentAddress: string | undefined,
    tokens: AccountTokens
): string | undefined {
    const loggedAddresses = tokens.addresses;
    if(currentAddress !== undefined) {
        return currentAddress;
    } else if(loggedAddresses.length > 0) {
        const defaultAccount = injectedAccounts.find(account => loggedAddresses.includes(account.address));
        return defaultAccount?.address;
    } else {
        return undefined;
    }
}

function tokenOrUndefinedIfExpired(token: Token | undefined): Token | undefined {
    if(token === undefined) {
        return undefined;
    }

    const expirationDateTime = token.expirationDateTime;
    if(expirationDateTime.isBefore(moment())) {
        return undefined;
    } else {
        return token;
    }
}
