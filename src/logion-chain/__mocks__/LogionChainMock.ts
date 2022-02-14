import BN from 'bn.js'
import { UUID } from "../UUID";
import { mockCompact } from "../../__mocks__/PolkadotApiMock";

export const LogionChainContextProvider = (props: any) => null;

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

const api = {
    tx: {
        assets: {
            create: () => {}
        },
        recovery: {
            asRecovered: () => {},
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
    }
};

let context = {
    apiState: 'CONNECT_INIT',
    injectedAccounts: null,
    api,
    connectedNodeMetadata: {

    }
};

export function setContextMock(value: any) {
    context = value;
}

export function useLogionChain() {
    return context;
}
