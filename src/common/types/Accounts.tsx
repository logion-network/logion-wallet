import { DateTime } from 'luxon';
import { InjectedAccount } from '@logion/extension';
import { LogionClient, Token } from '@logion/client';
import { LogionNodeApiClass, ValidAccountId } from '@logion/node-api';

export interface Account {
    readonly name: string,
    readonly accountId: ValidAccountId,
    readonly isLegalOfficer: boolean,
    readonly token?: Token,
}

export default interface Accounts {
    readonly all: Account[],
    readonly current?: Account,
}

export function buildAccounts(
    injectedAccounts: InjectedAccount[],
    userAddress: ValidAccountId | undefined,
    authenticatedClient: LogionClient,
    legalOfficers: Set<string>,
): Accounts {
    const all = injectedAccounts.map(injectedAccount => {
        const accountId = toValidAccountId(authenticatedClient.logionApi, injectedAccount);
        return {
            name: injectedAccount.meta.name!,
            accountId,
            isLegalOfficer: legalOfficers.has(injectedAccount.address),
            token: tokenOrUndefinedIfExpired(authenticatedClient.tokens.get(accountId)),
        };
    });

    const selectedAddress = currentOrDefaultAddress(injectedAccounts, userAddress, authenticatedClient);
    const current = all.find(account => account.accountId.toKey() === selectedAddress?.toKey());

    return {
        current,
        all,
    }
}

export function toValidAccountId(api: LogionNodeApiClass, injectedAccount: InjectedAccount): ValidAccountId {
    if(injectedAccount.type === "ethereum") {
        return api.queries.getValidAccountId(injectedAccount.address, "Ethereum");
    } else {
        return api.queries.getValidAccountId(injectedAccount.address, "Polkadot");
    }
}

function currentOrDefaultAddress(
    injectedAccounts: InjectedAccount[],
    currentAddress: ValidAccountId | undefined,
    authenticatedClient: LogionClient
): ValidAccountId | undefined {
    if(authenticatedClient === undefined) {
        return undefined;
    }
    const loggedAddresses = authenticatedClient.tokens.addresses;
    if(currentAddress !== undefined) {
        return currentAddress;
    } else if(loggedAddresses.length > 0) {
        const injectedAccountsKeys = injectedAccounts.map(injectedAccount => toValidAccountId(authenticatedClient.logionApi, injectedAccount).toKey());
        return loggedAddresses.find(account => injectedAccountsKeys.includes(account.toKey()));
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
