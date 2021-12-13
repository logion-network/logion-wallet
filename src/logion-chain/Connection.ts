import { ApiPromise, WsProvider } from '@polkadot/api';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import config from '../config';

import * as definitions from './interfaces/definitions';

export interface NodeMetadata {
    name: string,
    peerId: string
}

export async function buildApi(): Promise<ApiPromise> {
    const providerSocket = config.PROVIDER_SOCKET;
    const provider = buildProvider(providerSocket);
    const types = Object.values(definitions).reduce((res, { types }): object => ({ ...res, ...types }), {});
    return await ApiPromise.create({ provider, types, rpc: { ...jsonrpc, ...config.RPC } });
}

function buildProvider(providerSocket?: string): WsProvider {
    if(providerSocket !== undefined) {
        return new WsProvider(providerSocket);
    } else {
        const sockets = config.availableNodes.map(node => node.socket);
        sockets.sort(() => Math.random() - 0.5);
        return new WsProvider(sockets, 100);
    }
}
