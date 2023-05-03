import type { ApiPromise } from "@polkadot/api";
import { AccountType, ValidAccountId, UUID, LogionNodeApiClass } from "@logion/node-api";
import BN from 'bn.js'
import { It, Mock } from "moq.ts";
import { mockCompact } from "./PolkadotApiMock";
import type { Text } from '@polkadot/types-codec';

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

export function mockSimpleApi(): LogionNodeApiClass {
    return {
        polkadot: {
            createType: () => undefined,
        },
    } as unknown as LogionNodeApiClass;
}


const DEFAULT_BALANCE = new BN("42000000000000000000");

const DEFAULT_RECOVERY_CONFIG = {
    isSome: true,
    unwrap: () => {}
}

const DEFAULT_ACTIVE_RECOVERY = {
    isSome: true,
    unwrap: () => {}
}

const DEFAULT_COLLECTION_ITEM = {
    isSome: true,
    unwrap: () => {
        return {
            description: {
                toUtf8: () => {
                    return "something"
                }
            }
        }
    }
}

const DEFAULT_COLLECTION_SIZE = {
    isSome: true,
    unwrap: () => {
        return mockCompact(1)
    }
}

export const apiMock = {
    tx: {
        assets: {
            create: () => {}
        },
        recovery: {
            asRecovered: () => {},
        },
        loAuthorityList: {
            updateLegalOfficer: () => {},
        }
    },
    query: {
        assets: {
            account: (assetId: any, account: any) => {
                return Promise.resolve({
                    balance: DEFAULT_BALANCE
                });
            }
        },
        recovery: {
            recoverable: (accountId: any) => {
                return Promise.resolve(DEFAULT_RECOVERY_CONFIG);
            },
            activeRecoveries: (source: string, dest: string) => {
                return Promise.resolve(DEFAULT_ACTIVE_RECOVERY);
            },
        },
        logionLoc: {
            collectionSizeMap: (locId: UUID) => {
                return Promise.resolve(DEFAULT_COLLECTION_SIZE)
            },
            collectionItemsMap: (locId: UUID, itemId: string) => {
                return Promise.resolve(DEFAULT_COLLECTION_ITEM)
            }
        }
    },
    createType: () => {},
};

export const api = new Mock<LogionNodeApiClass>();
api.setup(instance => instance.polkadot).returns(apiMock as unknown as ApiPromise);
api.setup(instance => instance.queries.getValidAccountId).returns((address: string, _type: string) => mockValidPolkadotAccountId(address));
const localPeerId = new Mock<Text>();
localPeerId.setup(instance => instance.toString()).returns("Mock peer ID");
api.setup(instance => instance.polkadot.rpc.system.localPeerId()).returnsAsync(localPeerId.object());

api.setup(instance => instance.polkadot.createType(It.IsAny())).returnsAsync({});

export function setupApiMock(setupFunction: (api: Mock<LogionNodeApiClass>) => void) {
    setupFunction(api);
}
