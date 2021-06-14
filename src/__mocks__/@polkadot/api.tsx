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

export class ApiPromise {
    assetQueriesBeforeNone: number = 1;

    constructor(_: ApiPromiseArgs) {
        
    }

    on(eventName: string, callback: () => void) {
        apiCallbacks[eventName] = callback;
    }

    isReady = new Promise<ApiPromise>((resolve: ((api: ApiPromise) => void)) => isReadyResolve = () => resolve(this));

    query = {
        system: {
            events: (callback: ((issuedEvents: any) => void)) => { eventsCallback = callback }
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
            recoverable: queryRecoveryRecoverable
        }
    }

    rpc = {
        chain: {
            subscribeNewHeads: (callback: ((lastHeader: any) => void)) => newHeadsCallback = callback,
            getBlock: (hash: any) => { return { block: chain[hash.value] } }
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
            createRecovery: jest.fn().mockResolvedValue(() => {})
        }
    }
}

export function triggerEvent(eventName: string) {
    apiCallbacks[eventName]();
}

export const TOTAL_BLOCKS = 1000;

export const chain = buildChain(TOTAL_BLOCKS);

export const apiMock = new ApiPromise({provider: new WsProvider(""), types: null, rpc: null});

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

export function hashMock(blockNumber: number): object {
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

export function connectedAndReady() {
    triggerEvent("connected");
    isReadyResolve!();
}

export function mockSigner(signRaw: (parameters: object) => Promise<string>) {
    return {
        signRaw
    };
}
