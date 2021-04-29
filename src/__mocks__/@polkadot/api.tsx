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
            }
        },
        system: {
            name: () => Promise.resolve("Mock node"),
            localPeerId: () => Promise.resolve("Mock peer ID"),
        },
    }
}

export function triggerEvent(eventName: string) {
    apiCallbacks[eventName]();
}
