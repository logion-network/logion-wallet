import config from '../config';

export interface NodeMetadata {
    peerId: string
}

export function getEndpoints(): string[] {
    const providerSocket = config.PROVIDER_SOCKET;
    if(providerSocket !== undefined) {
        return [ providerSocket ];
    } else {
        return config.edgeNodes.map(node => node.socket);
    }
}
