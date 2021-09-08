import moment, { Moment } from 'moment';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { isLegalOfficer } from './LegalOfficer';

export interface Token {
    readonly value: string;
    readonly expirationDateTime: Moment;
}

export interface AccountAddress {
    readonly name: string,
    readonly address: string,
    readonly isLegalOfficer: boolean,
    readonly token?: Token,
}

export default interface Addresses {
    readonly addresses: AccountAddress[],
    readonly currentAddress?: AccountAddress,
}

export type AccountTokens = Record<string, Token>;

export function buildAddresses(
    injectedAccounts: InjectedAccountWithMeta[],
    userAddress: string | undefined,
    tokens: AccountTokens
): Addresses {
    const selectedAddress = currentOrDefaultAddress(injectedAccounts, userAddress, tokens);

    let currentAddress: AccountAddress | undefined;
    const matchingAddress = injectedAccounts.find(injectedAccount => injectedAccount.address === selectedAddress);
    if(selectedAddress !== undefined && matchingAddress !== undefined) {
        currentAddress = {
            name: matchingAddress.meta.name!,
            address: selectedAddress!,
            isLegalOfficer: isLegalOfficer(selectedAddress),
            token: tokenOrUndefinedIfExpired(tokens[selectedAddress]),
        }
    } else {
        currentAddress = undefined;
    }

    return {
        currentAddress,
        addresses: injectedAccounts.map(injectedAccount => ({
            name: injectedAccount.meta.name!,
            address: injectedAccount.address,
            isLegalOfficer: isLegalOfficer(injectedAccount.address),
            token: tokenOrUndefinedIfExpired(tokens[injectedAccount.address]),
        }))
    }
}

function currentOrDefaultAddress(
    injectedAccounts: InjectedAccountWithMeta[],
    currentAddress: string | undefined,
    tokens: AccountTokens
): string | undefined {
    const loggedAddresses = Object.keys(tokens);
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
