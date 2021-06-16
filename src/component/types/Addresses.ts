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
    return {
        currentAddress: {
            name: injectedAccounts.filter(injectedAccount => injectedAccount.address === userAddress)[0].meta.name!,
            address: userAddress,
        },
        addresses: injectedAccounts.map(injectedAccount => { return {
            name: injectedAccount.meta.name!,
            address: injectedAccount.address,
        };})
    }
}
