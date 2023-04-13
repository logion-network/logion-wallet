import { AccountType, ValidAccountId, LogionNodeApi } from "@logion/node-api";

export function mockValidPolkadotAccountId(address: string): ValidAccountId {
    return mockValidAccountId(address, "Polkadot");
}

export function mockValidAccountId(address: string, type: AccountType): ValidAccountId {
    return {
        address,
        type,
        toKey: () => `${type}:${address}`,
    } as ValidAccountId;
}

export function mockSimpleApi(): LogionNodeApi {
    return {
        createType: () => undefined,
    } as unknown as LogionNodeApi;
}

export const DEFAULT_LEGAL_OFFICER = mockValidPolkadotAccountId("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"); // Alice
export const ANOTHER_LEGAL_OFFICER = mockValidPolkadotAccountId("5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"); // Bob
export const A_THIRD_LEGAL_OFFICER = mockValidPolkadotAccountId("5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y"); // Charlie
