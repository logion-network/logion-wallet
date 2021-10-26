import axios, { AxiosInstance } from 'axios';

import config from '../config';
import Accounts from './types/Accounts';

export type AxiosFactory = (owner?: string) => AxiosInstance;

export async function fetchFromAvailableNodes<E>(
    axiosFactory: AxiosFactory,
    query: (axios: AxiosInstance) => Promise<E[]>,
): Promise<E[]> {
    const promises = config.availableNodes.map(node => query(axiosFactory(node.owner)!));
    return (await Promise.all(promises)).flatMap(result => result);
}

export async function fetchFromAvailableNodesAndMap<R, E>(
    axiosFactory: AxiosFactory,
    query: (axios: AxiosInstance) => Promise<R>,
    resultMapper: (result: R) => E[]
): Promise<E[]> {
    const promises = config.availableNodes.map(node => query(axiosFactory(node.owner)!));
    return (await Promise.all(promises)).flatMap(resultMapper);
}

export function buildAxiosFactory(accounts: Accounts): AxiosFactory {
    const currentAddress = accounts.current;
    let headers: any = undefined;
    if(currentAddress !== undefined && currentAddress.token !== undefined) {
        headers = {
            'Authorization': `Bearer ${currentAddress.token.value}`,
        };
    }

    return (owner?: string) => axios.create({
        baseURL: baseUrl(owner),
        headers,
    });
}

export function anonymousAxiosFactory(): AxiosFactory {
    return (owner?: string) => axios.create({
        baseURL: baseUrl(owner)
    });
}

function baseUrl(owner?: string): string {
    if(owner === undefined) {
        return "";
    } else {
        const node = config.availableNodes.find(node => node.owner === owner);
        return node!.api;
    }
}

export function anyNodeAxios(accounts: Accounts): AxiosInstance {
    const factory = buildAxiosFactory(accounts);
    const anyNode = config.availableNodes[0];
    return factory(anyNode.owner);
}
