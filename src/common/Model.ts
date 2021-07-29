import axios from 'axios';

import {
    TokenizationRequestStatus,
    TokenizationRequest,
    TransactionsSet,
    LegalOfficerDecisionStatus,
    ProtectionRequestStatus,
    ProtectionRequest,
} from './types/ModelTypes';

export interface FetchRequestSpecification {
    legalOfficerAddress?: string,
    requesterAddress?: string,
    status: TokenizationRequestStatus
}

export async function fetchRequests(specification: FetchRequestSpecification): Promise<TokenizationRequest[]> {
    const response = await axios.put("/api/token-request", specification);
    return response.data.requests;
}

export type ProtectionRequestKind = 'RECOVERY' | 'PROTECTION_ONLY' | 'ANY';

export interface FetchProtectionRequestSpecification {
    legalOfficerAddress?: string,
    requesterAddress?: string,
    decisionStatuses: LegalOfficerDecisionStatus[],
    kind: ProtectionRequestKind,
    protectionRequestStatus?: ProtectionRequestStatus,
}

export async function fetchProtectionRequests(
        specification: FetchProtectionRequestSpecification): Promise<ProtectionRequest[]> {
    const response = await axios.put("/api/protection-request", specification);
    return response.data.requests;
}

export interface FetchTransactionsSpecficication {
    address: string,
}

export async function getTransactions(request: FetchTransactionsSpecficication): Promise<TransactionsSet> {
    return Promise.resolve({
        transactions: [
            {
                from: request.address,
                to: "some-fake-address",
                pallet: "balances",
                method: "transfer",
                transferValue: "10000000",
                tip: "0",
                fee: "125000",
                reserved: "0",
                total: "10125000",
                createdOn: "2021-07-27T11:14:00.000",
                type: 'Sent',
            },
            {
                from: "some-fake-address",
                to: request.address,
                pallet: "balances",
                method: "transfer",
                transferValue: "20000000",
                tip: "0",
                fee: "125000",
                reserved: "0",
                total: "20125000",
                createdOn: "2021-07-26T11:14:00.000",
                type: 'Received',
            },
            {
                from: "some-fake-address",
                to: request.address,
                pallet: "balances",
                method: "transfer",
                transferValue: "0",
                tip: "0",
                fee: "125000",
                reserved: "12000",
                total: "137000",
                createdOn: "2021-07-25T11:14:00.000",
                type: 'Other',
            },
            {
                from: "some-fake-address",
                to: request.address,
                pallet: "balances",
                method: "transfer",
                transferValue: "0",
                tip: "0",
                fee: "125000",
                reserved: "12000",
                total: "137000",
                createdOn: "2021-07-25T11:14:00.000",
                type: 'Other',
            },
            {
                from: "some-fake-address",
                to: request.address,
                pallet: "balances",
                method: "transfer",
                transferValue: "0",
                tip: "0",
                fee: "125000",
                reserved: "12000",
                total: "137000",
                createdOn: "2021-07-25T11:14:00.000",
                type: 'Other',
            },
            {
                from: "some-fake-address",
                to: request.address,
                pallet: "balances",
                method: "transfer",
                transferValue: "0",
                tip: "0",
                fee: "125000",
                reserved: "12000",
                total: "137000",
                createdOn: "2021-07-25T11:14:00.000",
                type: 'Other',
            },
            {
                from: "some-fake-address",
                to: request.address,
                pallet: "balances",
                method: "transfer",
                transferValue: "0",
                tip: "0",
                fee: "125000",
                reserved: "12000",
                total: "137000",
                createdOn: "2021-07-25T11:14:00.000",
                type: 'Other',
            }
        ]
    });
}
