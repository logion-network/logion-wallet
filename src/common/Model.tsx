import { AxiosInstance } from 'axios';

import {
    TransactionsSet,
    ProtectionRequestStatus,
    ProtectionRequest,
    Transaction,
    LocRequest,
    LocRequestStatus,
} from './types/ModelTypes';
import Identity from './types/Identity';
import { UUID } from '../logion-chain/UUID';
import { LocType } from '../logion-chain/Types';
import moment from 'moment';

export type ProtectionRequestKind = 'RECOVERY' | 'PROTECTION_ONLY' | 'ANY';

export interface FetchProtectionRequestSpecification {
    requesterAddress?: string,
    kind: ProtectionRequestKind,
    statuses?: ProtectionRequestStatus[],
}

export async function fetchProtectionRequests(
    axios: AxiosInstance,
    specification: FetchProtectionRequestSpecification): Promise<ProtectionRequest[]> {
    const response = await axios.put("/api/protection-request", specification);
    return response.data.requests;
}

export interface FetchTransactionsSpecification {
    address: string,
}

export async function getTransactions(
    axios: AxiosInstance,
    request: FetchTransactionsSpecification
): Promise<TransactionsSet> {
    const response = await axios.put("/api/transaction", request);
    return {
        transactions: response.data.transactions.map((transaction: Transaction) => enrichTransaction(transaction, request.address))
    };
}

function enrichTransaction(transaction: Transaction, address: string): Transaction {
    return {
        ...transaction,
        type: transactionType(transaction, address)
    }
}

function transactionType(transaction: Transaction, address: string): string {
    if(transaction.pallet === "verifiedRecovery") {
        if (transaction.method === "createRecovery") {
            return "Recovery created";
        } else {
            return "Other";
        }
    } else if(transaction.pallet === "recovery") {
        if(transaction.method === "createRecovery") {
            return "Recovery created";
        } else if(transaction.method === "vouchRecovery") {
            return "Recovery vouched";
        } else if(transaction.method === "initiateRecovery") {
            return "Recovery initiated";
        } else if(transaction.method === "claimRecovery") {
            return "Recovery claimed";
        } else if(transaction.method === "asRecovered") {
            return "Assets recovered";
        } else {
            return "Other";
        }
    } else if(transaction.pallet === "balances") {
        if(transaction.method.startsWith("transfer")) {
            if(transaction.from === address) {
                return "Sent";
            } else {
                return "Received";
            }
        } else {
            return "Other";
        }
    } else if(transaction.pallet === "assets") {
        if(transaction.method === "mint") {
            return "Asset tokens minted";
        } else if(transaction.method === "create") {
            return "Asset created";
        } else if(transaction.method === "setMetadata") {
            return "Asset metadata set";
        } else {
            return "Other";
        }
    } else if(transaction.pallet === "logionLoc") {
        if(transaction.method === "addFile") {
            return "File added to LOC";
        } else if(transaction.method === "addLink") {
            return "Link added to LOC";
        } else if(transaction.method === "addMetadata") {
            return "Metadata added to LOC";
        } else if(transaction.method === "close") {
            return "LOC closed";
        } else if(transaction.method === "createLoc") {
            return "LOC created";
        } else {
            return "Other";
        }
    } else {
        return 'Other';
    }
}

export interface FetchLocRequestSpecification {
    ownerAddress?: string,
    requesterAddress?: string,
    statuses: LocRequestStatus[],
    locTypes: LocType[],
}

export async function fetchLocRequests(
    axios: AxiosInstance,
    specification: FetchLocRequestSpecification,
): Promise<LocRequest[]> {
    const response = await axios.put(`/api/loc-request`, specification);
    return response.data.requests;
}

export async function fetchLocRequest(
    axios: AxiosInstance,
    requestId: string
): Promise<LocRequest> {
    const response = await axios.get(`/api/loc-request/${ requestId }`);
    // TODO remove fake voidedOn
    return {
        ...response.data,
        voidedOn: moment().toISOString()
    };
}

export async function fetchPublicLoc(
    axios: AxiosInstance,
    requestId: string
): Promise<LocRequest> {
    const response = await axios.get(`/api/loc-request/${ requestId }/public`);
    // TODO remove fake voidedOn
    return {
        ...response.data,
        voidedOn: moment().toISOString()
    };
}

export interface CreateLocRequest {
    ownerAddress: string;
    requesterAddress: string;
    description: string;
    locType: LocType;
    userIdentity?: Identity;
}

export async function createLocRequest(
    axios: AxiosInstance,
    request: CreateLocRequest,
): Promise<LocRequest> {
    const response = await axios.post(`/api/loc-request`, request);
    return response.data;
}

export async function confirmLocFile(
    axios: AxiosInstance,
    locId: UUID,
    hash: string
): Promise<void> {
    const requestId = locId.toString();
    await axios.put(`/api/loc-request/${requestId}/files/${hash}/confirm`);
}

export async function deleteLocFile(
    axios: AxiosInstance,
    locId: UUID,
    hash: string
): Promise<void> {
    const requestId = locId.toString();
    await axios.delete(`/api/loc-request/${requestId}/files/${hash}`);
}

export async function preClose(
    axios: AxiosInstance,
    locId: UUID,
): Promise<void> {
    const requestId = locId.toString();
    await axios.post(`/api/loc-request/${requestId}/close`);
}

export async function preVoid(
    axios: AxiosInstance,
    locId: UUID,
): Promise<void> {
    //const requestId = locId.toString();
    //await axios.post(`/api/loc-request/${requestId}/void`); // TODO
    return Promise.resolve();
}
