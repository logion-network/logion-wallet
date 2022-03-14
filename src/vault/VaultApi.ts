import { AxiosInstance } from "axios";

export type VaultTransferRequestStatus = "ACCEPTED" | "PENDING" | "REJECTED" | "CANCELLED";

export interface VaultTransferRequestDecision {
    decisionOn: string;
    rejectReason?: string;
}

export interface VaultTransferRequest {
    id: string;
    createdOn: string;
    requesterAddress: string;
    destination: string;
    amount: string;
    block: string;
    index: number;
    decision?: VaultTransferRequestDecision;
    status: VaultTransferRequestStatus;
}

export interface CreateVaultTransferRequest {
    requesterAddress: string;
    destination: string;
    amount: string;
    block: string;
    index: number;
}

export interface FetchVaultTransferRequest {
    statuses?: VaultTransferRequestStatus[];
    requesterAddress?: string;
}

export class VaultApi {

    constructor(axios: AxiosInstance) {
        this.axios = axios;
    }

    private axios: AxiosInstance;

    async getVaultTransferRequests(fetch: FetchVaultTransferRequest): Promise<VaultTransferRequest[]> {
        const requests = (await this.axios.put("/api/vault-transfer-request", fetch)
            .then(response => response.data.requests)) as VaultTransferRequest[];
        return requests;
    }

    async createVaultTransferRequest(legalOfficer: CreateVaultTransferRequest): Promise<VaultTransferRequest> {
        return await this.axios.post('/api/vault-transfer-request', legalOfficer);
    }
}
