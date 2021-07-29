import axios from 'axios';

import {
    TokenizationRequestStatus,
    TokenizationRequest,
    TransactionsSet,
    LegalOfficerDecisionStatus,
    ProtectionRequestStatus,
    ProtectionRequest,
    Transaction,
    TransactionType,
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
    const response = await axios.put("/api/protection-request", request);
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

function transactionType(transaction: Transaction, address: string): TransactionType {
    return 'Other';
}
