import { ApiPromise, WsProvider } from '@polkadot/api';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import config, { Node } from '../config';

export type ApiState= 'DISCONNECTED'
    | 'CONNECT_INIT'
    | 'CONNECTING'
    | 'READY'
    | 'ERROR';

export interface NodeMetadata {
    name: string,
    peerId: string
}

export function buildApi(selectedNode: Node | null): ApiPromise {
    const providerSocket = config.PROVIDER_SOCKET;
    const provider = buildProvider(selectedNode, providerSocket);
    return new ApiPromise({ provider, types: config.types, rpc: { ...jsonrpc, ...config.RPC } });
}

function buildProvider(selectedNode: Node | null, providerSocket?: string): WsProvider {
    if(providerSocket !== undefined) {
        return new WsProvider(providerSocket);
    } else if(selectedNode !== null) {
        return new WsProvider(selectedNode.socket);
    } else {
        throw new Error("No provider socket nor selected node");
    }
}
