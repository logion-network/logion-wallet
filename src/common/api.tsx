import axios, { AxiosInstance } from 'axios';
import { LegalOfficer } from '../directory/DirectoryApi';

import Accounts, { Account } from './types/Accounts';

export interface Endpoint {
    url: string;
}

export interface MultiResponse<R> extends Record<string, R> {
    
}

export interface MultiSourceHttpClientState<E extends Endpoint> {
    nodesUp: E[];
    nodesDown: E[];
}

export function allUp<E extends Endpoint>(endpoints: E[]): MultiSourceHttpClientState<E> {
    return {
        nodesUp: endpoints,
        nodesDown: []
    }
}

export type Query<R> = (axios: AxiosInstance) => Promise<R>;

export class MultiSourceHttpClient<E extends Endpoint, R> {

    constructor(initialState: MultiSourceHttpClientState<E>, token?: string) {
        this.nodesUp = initialState.nodesUp.slice(0);
        this.nodesDown = initialState.nodesDown.slice(0);
        this.token = token;
    }

    private nodesUp: E[];

    private nodesDown: E[];

    private token?: string;

    async fetch(query: Query<R>): Promise<MultiResponse<R>> {
        const currentNodesUp = this.nodesUp.slice(0);
        this.nodesUp = [];

        const promises = currentNodesUp.map(node => query(buildAuthenticatedAxios(node.url, this.token)));
        const allSettled = await Promise.allSettled(promises);
        let multiResponse: MultiResponse<R> = {};
        for(let i = 0; i < allSettled.length; ++i) {
            const promiseResult = allSettled[i];
            if(promiseResult.status === 'fulfilled') {
                multiResponse[currentNodesUp[i].url] = promiseResult.value;
                this.nodesUp.push(currentNodesUp[i]);
            } else {
                this.nodesDown.push(currentNodesUp[i]);
            }
        }
        return multiResponse;
    }

    getState(): MultiSourceHttpClientState<E> {
        return {
            nodesUp: this.nodesUp.slice(0),
            nodesDown: this.nodesDown.slice(0)
        };
    }
}

export class AnySourceHttpClient<E extends Endpoint, R> {

    constructor(initialState: MultiSourceHttpClientState<E>, token?: string) {
        this.nodesUp = initialState.nodesUp.slice(0);
        this.nodesDown = initialState.nodesDown.slice(0);
        this.token = token;
    }

    private nodesUp: E[];

    private nodesDown: E[];

    private token?: string;

    async fetch(query: Query<R>): Promise<R | undefined> {
        while(this.nodesUp.length > 0) {
            const selectedEndpointIndex = this.selectedEndpointIndex();
            let selectedEndpoint = this.nodesUp[selectedEndpointIndex];
            try {
                return await query(buildAuthenticatedAxios(selectedEndpoint.url, this.token));
            } catch(error) {
                this.nodesUp.splice(selectedEndpointIndex, 1);
                this.nodesDown.push(selectedEndpoint);
            }
        }
        return undefined;
    }

    private selectedEndpointIndex(): number {
        return Math.floor(Math.random() * this.nodesUp.length);
    }

    getState(): MultiSourceHttpClientState<E> {
        return {
            nodesUp: this.nodesUp.slice(0),
            nodesDown: this.nodesDown.slice(0)
        };
    }
}

export function aggregateArrays<E>(response: MultiResponse<E[]>): E[] {
    let array: E[] = [];
    for(const key in response) {
        array = array.concat(response[key]);
    }
    return array;
}

export type AxiosFactory = (owner?: string) => AxiosInstance;

export function buildAxiosFactory(accounts: Accounts, legalOfficers: LegalOfficer[]): AxiosFactory {
    return (owner?: string) => buildAxios(accounts, node(legalOfficers, owner));
}

export function buildAxios(accounts: Accounts, node: Endpoint | undefined): AxiosInstance {
    const currentAddress = accounts.current;
    return buildAxiosForAccount(currentAddress, node);
}

export function buildAxiosForAccount(currentAddress: Account | undefined, node: Endpoint | undefined): AxiosInstance {
    return buildAuthenticatedAxios(node?.url || "", currentAddress?.token?.value);
}

export function buildAuthenticatedAxios(endpoint: string, token?: string) {
    let headers: any = undefined;
    if(token !== undefined) {
        headers = {
            'Authorization': `Bearer ${token}`,
        };
    }
    return axios.create({
        baseURL: endpoint,
        headers,
    });
}

export function anonymousAxiosFactory(legalOfficers: LegalOfficer[]): AxiosFactory {
    return (owner?: string) => axios.create({
        baseURL: baseUrl(legalOfficers, owner)
    });
}

function baseUrl(legalOfficers: LegalOfficer[], owner?: string): string {
    return node(legalOfficers, owner)?.url || "";
}

function node(legalOfficers: LegalOfficer[], owner?: string): Endpoint | undefined {
    if(owner === undefined) {
        return undefined;
    } else {
        const legalOfficer = legalOfficers.find(legalOfficer => legalOfficer.address === owner);
        if(legalOfficer) {
            return {
                url: legalOfficer.node
            };
        } else {
            return undefined;
        }
    }
}
