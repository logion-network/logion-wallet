import { UUID } from "../logion-chain/UUID";

export class WsProvider {
    constructor(socket: string) {
    }
}

interface ApiPromiseArgs {
    provider: WsProvider,
    types: any,
    rpc: any,
}

let apiCallbacks: Record<string, () => void> = {};

export let isReadyResolve: (() => void) | null = null;

export let eventsCallback: ((issuedEvents: any) => void) | null = null;

export let newHeadsCallback: ((lastHeader: any) => void) | null = null;

export let queryRecoveryRecoverable = jest.fn();

export function setQueryRecoveryRecoverable(mockFn: any) {
    queryRecoveryRecoverable = mockFn;
}

export let queryRecoveryActiveRecoveries = jest.fn();

export function setQueryRecoveryActiveRecoveries(mockFn: any) {
    queryRecoveryActiveRecoveries = mockFn;
}

export const DEFAULT_LOC = {
    owner: "owner",
    requester: "requester",
    metadata: [
        {
            name: "meta_name",
            value: "meta_value",
            submitter: "owner",
        }
    ],
    files: [
        {
            hash: "0x91820202c3d0fea0c494b53e3352f1934bc177484e3f41ca2c4bca4572d71cd2",
            nature: "file-nature",
            submitter: "owner",
        }
    ],
    links: [
        {
            id: new UUID("90fcde7e-a255-404e-8b15-32963a4e64c0"),
            nature: "file-nature"
        }
    ],
    closed: false,
    locType: 'Transaction',
}

export const CURRENT_BLOCK_NUMBER = {
    toBigInt: () => BigInt(42)
};

export const CURRENT_BLOCK = {
    block: {
        header: {
            number: CURRENT_BLOCK_NUMBER
        }
    }
};

export class ApiPromise {
    assetQueriesBeforeNone: number = 1;

    static create(): Promise<ApiPromise> {
        return Promise.resolve(new ApiPromise());
    }

    consts = {
        timestamp: {
            minimumPeriod: {
                toBigInt: () => BigInt(3000)
            }
        }
    }

    query = {
        system: {
            events: (callback: ((issuedEvents: any) => void)) => { eventsCallback = callback },
            account: () => ({data: {free: "42", reserved: "0"}}),
        },
        assets: {
            asset: (id: any) => {
                --this.assetQueriesBeforeNone;
                if(this.assetQueriesBeforeNone <= 0) {
                    return {isSome: false}
                } else {
                    return {isSome: true}
                }
            }
        },
        recovery: {
            recoverable: queryRecoveryRecoverable,
            activeRecoveries: queryRecoveryActiveRecoveries,
        },
        logionLoc: {
            locMap: () => Promise.resolve({
                isSome: true,
                unwrap: () => ({
                    owner: DEFAULT_LOC.owner,
                    requester: {
                        isAccount: true,
                        isLoc: false,
                        asAccount: {
                            toString: () => DEFAULT_LOC.requester
                        },
                        asLoc: {
                            toString: () => undefined
                        }
                    },
                    metadata: {
                        toArray: () => DEFAULT_LOC.metadata.map(item => ({
                            name: {
                                toUtf8: () => item.name
                            },
                            value: {
                                toUtf8: () => item.value
                            },
                            submitter: {
                                toString: () => item.submitter
                            }
                        }))
                    },
                    files: {
                        toArray: () => DEFAULT_LOC.files.map(file => ({
                            get: (key: string) => {
                                if(key === 'hash') {
                                    return { toHex: () => file.hash }
                                }
                            },
                            nature: {
                                toUtf8: () => file.nature
                            },
                            submitter: {
                                toString: () => file.submitter
                            }
                        }))
                    },
                    links: {
                        toArray: () => DEFAULT_LOC.links.map(link => ({
                            id: {
                                toString: () => link.id.toDecimalString()
                            },
                            nature: {
                                toUtf8: () => link.nature
                            }
                        }))
                    },
                    closed: {
                        isTrue: DEFAULT_LOC.closed,
                        isFalse: !DEFAULT_LOC.closed,
                    },
                    loc_type: {
                        isTransaction: DEFAULT_LOC.locType === 'Transaction',
                        isIdentity: DEFAULT_LOC.locType === 'Identity',
                        toString: () => DEFAULT_LOC.locType,
                    },
                    void_info: {
                        isSome: false
                    },
                    replacer_of: {
                        isSome: false
                    }
                })
            })
        }
    }

    rpc = {
        chain: {
            subscribeNewHeads: (callback: ((lastHeader: any) => void)) => newHeadsCallback = callback,
            getBlock: (hash?: any) => {
                if(hash === undefined) {
                    return CURRENT_BLOCK;
                } else {
                    return { block: chain[hash.value] }
                }
            }
        },
        system: {
            name: () => Promise.resolve("Mock node"),
            localPeerId: () => Promise.resolve("Mock peer ID"),
        },
    }

    chain = {
        head: chain[TOTAL_BLOCKS - 1],
        chain
    }

    tx = {
        assets: {
            create: () => {},
            setMetadata: () => {},
            mint: () => {},
        },
        recovery: {
            initiateRecovery: jest.fn().mockResolvedValue(() => {}),
        },
        logionLoc: {
            createPolkadotTransactionLoc: jest.fn().mockResolvedValue(() => {}),
            createPolkadotIdentityLoc: jest.fn().mockResolvedValue(() => {}),
            createLogionTransactionLoc: jest.fn().mockResolvedValue(() => {}),
            createLogionIdentityLoc: jest.fn().mockResolvedValue(() => {}),
            addMetadata: jest.fn().mockResolvedValue(() => {}),
            addFile: jest.fn().mockResolvedValue(() => {}),
            addLink: jest.fn().mockResolvedValue(() => {}),
        },
        verifiedRecovery: {
            createRecovery: jest.fn().mockResolvedValue(() => {}),
        },
    }
}

export function triggerEvent(eventName: string) {
    apiCallbacks[eventName]();
}

export const TOTAL_BLOCKS = 1000;

export const chain = buildChain(TOTAL_BLOCKS);

export const apiMock: unknown = new ApiPromise();

function buildChain(blocks: number): any[] {
    const chain: any[] = [];
    let blockTime = new Date().valueOf();
    for(let blockNumber = blocks - 1; blockNumber >= 0; --blockNumber) {
        chain[blockNumber] = buildBlockMock(blockNumber, blockTime);
        blockTime -= 6000;
    }
    return chain;
}

function buildBlockMock(blockNumber: number, blockTime: number): object {
    const block = {
        header: {
            number: mockCompact(blockNumber),
            parentHash: blockNumber > 1 ? hashMock(blockNumber - 1) : hashMock(0),
        },
        extrinsics: [
            {
                method: {
                    section: "timestamp",
                    method: "set",
                    args: String(blockTime)
                }
            }
        ],
        hash: hashMock(blockNumber)
    };

    if(blockNumber % 2 === 0) {
        block.extrinsics.push({
            method: {
                section: "balances",
                method: "transfer",
                args: ""
            }
        });
    }

    return block;
}

export function hashMock(blockNumber: number): unknown {
    return {
        value: blockNumber,
        toString: () => blockNumber.toString()
    };
}

class SubmittableMock {
    signatureType: 'KEYRING' | 'INJECTED' | null = null;
    readonly unsubscriber: () => void = () => {};

    signAndSend(arg1: any, arg2: any, arg3: any) {
        if(arg3 !== undefined) {
            this.signatureType = 'INJECTED';
        } else {
            this.signatureType = 'KEYRING';
        }
        return Promise.resolve(this.unsubscriber);
    }
}

export function mockSubmittable(): any {
    return new SubmittableMock();
}

export function blockMock(body: object): object {
    return {
        ...body
    };
}

export function extrinsicsMock(size: number): any[] {
    const extrinsics = [];
    for(let i = 0; i < size; ++i) {
        extrinsics.push({});
    }
    return extrinsics;
}

export function teardown() {
    apiCallbacks = {};
    isReadyResolve = null;
    eventsCallback = null;
    newHeadsCallback = null;
}

export function mockVec(array: any[]): any {
    return {
        toArray: () => array
    };
}

export function mockCompact(number: number): any {
    return {
        toNumber: () => number
    };
}

export function mockSigner(signRaw: (parameters: object) => Promise<string>) {
    return {
        signRaw
    };
}
