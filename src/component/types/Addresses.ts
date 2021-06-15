export interface AccountAddress {
    name: string,
    address: string,
}

export default interface Addresses {
    addresses: AccountAddress[],
    currentAddress: AccountAddress,
}
