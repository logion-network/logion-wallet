export class WsProvider {
    constructor(socket: string) {
    }
}

interface ApiPromiseArgs {
    provider: WsProvider,
    types: any,
    rpc: any
}

let apiCallbacks: Record<string, () => void> = {};

export class ApiPromise {

    constructor(args: ApiPromiseArgs) {
        
    }

    on(eventName: string, callback: () => void) {
        apiCallbacks[eventName] = callback;
    }

    isReady = new Promise((_) => {});

    query = {
        system: {
            events: (callback: ((issuedEvents: any) => void)) => {
                callback({
                    toArray: () => [
                        {
                            
                        }
                    ]
                });
            }
        }
    }

    rpc = {
        chain: {
            subscribeNewHeads: (callback: ((lastHeader: any) => void)) => {
                callback({
                    number: {
                        toNumber: () => 42,
                    }
                });
            },
            getBlock: (hash: any) => {return {block: chain[hash.value]};}
        },
        system: {
            name: () => Promise.resolve("Mock node"),
            localPeerId: () => Promise.resolve("Mock peer ID"),
        },
    }

    mock = {
        head: headHash
    }
}

export function triggerEvent(eventName: string) {
    apiCallbacks[eventName]();
}

export const TOTAL_BLOCKS = 1000;

export const headHash = hashMock(TOTAL_BLOCKS - 1);

export const apiMock = new ApiPromise({provider: new WsProvider(""), types: null, rpc: null});

export const chain = buildChain(TOTAL_BLOCKS);

function buildChain(blocks: number): any[] {
    const chain: any[] = [];
    let blockTime = new Date().valueOf();
    for(let blockNumber = blocks - 1; blockNumber >= 0; --blockNumber) {
        chain[blockNumber] = {
            header: {
                number: {toNumber: () => blockNumber},
                parentHash: hashMock(blockNumber - 1),
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
        blockTime -= 6000;

        if(blockNumber % 2 === 0) {
            chain[blockNumber].extrinsics.push({
                method: {
                    section: "balances",
                    method: "transfer",
                    args: String(blockTime)
                }
            });
        }
    }
    return chain;
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
