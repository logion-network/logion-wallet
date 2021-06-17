import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { isLegalOfficer } from '../../legal-officer/Types';

export interface AccountAddress {
    name: string,
    address: string,
    isLegalOfficer: boolean,
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
            isLegalOfficer: isLegalOfficer(userAddress)
        }
    } else {
        currentAddress = {
            name: "",
            address: userAddress,
            isLegalOfficer: isLegalOfficer(userAddress),
        }
    }
    return {
        currentAddress,
        addresses: injectedAccounts.map(injectedAccount => { return {
            name: injectedAccount.meta.name!,
            address: injectedAccount.address,
            isLegalOfficer: isLegalOfficer(injectedAccount.address),
        };})
    }
}
