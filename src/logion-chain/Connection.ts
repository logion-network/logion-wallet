import config from '../config';

export interface NodeMetadata {
    peerId: string
}

export function getEndpoints(): string[] {
    const providerSocket = config.PROVIDER_SOCKET;
    if(providerSocket !== undefined) {
        return [ providerSocket ];
    } else {
        const sockets = config.edgeNodes.map(node => node.socket);
        sockets.sort(() => Math.random() - 0.5);
        return sockets;
    }
}
