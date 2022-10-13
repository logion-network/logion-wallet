import { DateTime } from 'luxon';
import { InjectedAccount } from '@logion/extension';
import { Token } from '@logion/client/dist/Http';
import { LogionClient } from '@logion/client';

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

export function buildAccounts(
    injectedAccounts: InjectedAccount[],
    userAddress: string | undefined,
    authenticatedClient: LogionClient,
    legalOfficers: Set<string>,
): Accounts {
    const all = injectedAccounts.map(injectedAccount => ({
        name: injectedAccount.meta.name!,
        address: injectedAccount.address,
        isLegalOfficer: legalOfficers.has(injectedAccount.address),
        token: tokenOrUndefinedIfExpired(authenticatedClient.tokens.get(injectedAccount.address)),
    }));

    const selectedAddress = currentOrDefaultAddress(injectedAccounts, userAddress, authenticatedClient);
    const current = all.find(account => account.address === selectedAddress);

    return {
        current,
        all,
    }
}

function currentOrDefaultAddress(
    injectedAccounts: InjectedAccount[],
    currentAddress: string | undefined,
    authenticatedClient?: LogionClient
): string | undefined {
    if(authenticatedClient === undefined) {
        return undefined;
    }
    const loggedAddresses = authenticatedClient.tokens.addresses;
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
    if(expirationDateTime < DateTime.now()) {
        return undefined;
    } else {
        return token;
    }
}
