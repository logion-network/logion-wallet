import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

export interface AccountAddress {
    name: string,
    address: string,
}

export default interface Addresses {
    addresses: AccountAddress[],
    currentAddress: AccountAddress,
}

export function buildAddresses(injectedAccounts: InjectedAccountWithMeta[], userAddress: string): Addresses {
    let currentAddress: AccountAddress | null = null;
    const matchingAddress = injectedAccounts.filter(injectedAccount => injectedAccount.address === userAddress)[0];
    if(matchingAddress !== undefined) {
        currentAddress = {
            name: matchingAddress.meta.name!,
            address: userAddress,
        }
    } else {
        currentAddress = {
            name: "",
            address: userAddress,
        }
    }
    return {
        currentAddress,
        addresses: injectedAccounts.map(injectedAccount => { return {
            name: injectedAccount.meta.name!,
            address: injectedAccount.address,
        };})
    }
}
