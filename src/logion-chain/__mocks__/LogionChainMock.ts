import { DateTime } from "luxon";
import BN from 'bn.js'
import { UUID } from "@logion/node-api/dist/UUID";

import { mockCompact } from "../../__mocks__/PolkadotApiMock";
import { LegalOfficer } from '@logion/client';
import { DEFAULT_LEGAL_OFFICER, legalOfficers } from 'src/common/TestData';
import { TEST_WALLET_USER } from 'src/wallet-user/TestData';
import { AxiosInstance } from 'axios';
import { Mock } from 'moq.ts';
import Accounts, { Account } from 'src/common/types/Accounts';
import { LogionClient } from '@logion/client/dist/LogionClient';
import { LogionClient as LogionClientMock } from '../../__mocks__/LogionClientMock';
import { LegalOfficerData } from "src/legal-officer/LegalOfficerData";

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
    }
};

let client: LogionClient | LogionClientMock = new LogionClientMock();

export let authenticate = jest.fn();

export let saveOfficer = jest.fn();

function getOfficer(address: string | undefined): LegalOfficer | undefined {
    return legalOfficers.find(legalOfficer => legalOfficer.address === address);
}

export let selectAddress = jest.fn();

export const DEFAULT_USER_ACCOUNT: Account = {
    name: "name",
    address: TEST_WALLET_USER,
    isLegalOfficer: false,
    token: {
        value: "token",
        expirationDateTime: DateTime.now(),
    },
}

export const DEFAULT_LEGAL_OFFICER_ACCOUNT: Account = {
    name: "name",
    address: DEFAULT_LEGAL_OFFICER,
    isLegalOfficer: true,
    token: {
        value: "token",
        expirationDateTime: DateTime.now(),
    },
}

export let accounts: Accounts | null = {
    current: DEFAULT_USER_ACCOUNT,
    all: [ DEFAULT_USER_ACCOUNT ]
}

export function setCurrentAddress(value: Account | undefined) {
    if(value === undefined) {
        accounts = {
            current: undefined,
            all: [ DEFAULT_USER_ACCOUNT ]
        };
    } else {
        accounts = {
            current: value,
            all: [ value ]
        };
    }
    if(context) {
        context.accounts = accounts;
    }
}

export function setAddresses(value: Accounts | null) {
    accounts = value;
}

export let axiosMock = new Mock<AxiosInstance>();

export function resetAxiosMock() {
    axiosMock = new Mock<AxiosInstance>();
}

let context: any = undefined;

export function setContextMock(value: any) {
    context = value;
}

export function useLogionChain() {
    if(context) {
        return context;
    } else {
        return {
            apiState: 'CONNECT_INIT',
            injectedAccounts: null,
            api,
            connectedNodeMetadata: {

            },
            selectAddress,
            accounts,
            axiosFactory: () => axiosMock.object(),
            authenticate,
            getOfficer,
            saveOfficer,
            client,
            isCurrentAuthenticated: () => true,
            authenticateAddress,
        };
    }
}

function authenticateAddress(address: string) {
    return {
        value: `some-token-value-for-${address}`,
        expirationDate: DateTime.now().toISO(),
    };
}

export function setClientMock(mock: LogionClient) {
    client = mock;
}
