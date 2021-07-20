import BN from 'bn.js'

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
    }
};

let context = {
    apiState: 'CONNECT_INIT',
    injectedAccounts: null,
    api,
};

export function setContextMock(value: any) {
    context = value;
}

export function useLogionChain() {
    return context;
}
