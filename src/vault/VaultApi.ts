import { AxiosInstance } from "axios";
import UserIdentity from "../common/types/Identity";
import PostalAddress from "../common/types/PostalAddress";

export type VaultTransferRequestStatus = "ACCEPTED" | "PENDING" | "REJECTED" | "CANCELLED" | "REJECTED_CANCELLED";

export interface VaultTransferRequestDecision {
    decisionOn: string;
    rejectReason?: string;
}

export interface VaultTransferRequest {
    id: string;
    createdOn: string;
    origin: string;
    destination: string;
    amount: string;
    block: string;
    index: number;
    decision?: VaultTransferRequestDecision;
    status: VaultTransferRequestStatus;
    legalOfficerAddress: string;
    requesterIdentity: UserIdentity;
    requesterPostalAddress: PostalAddress;
}

export interface CreateVaultTransferRequest {
    origin: string;
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

    constructor(axios: AxiosInstance, legalOfficerAddress: string) {
        this.axios = axios;
        this.legalOfficerAddress = legalOfficerAddress;
    }

    private axios: AxiosInstance;

    private readonly legalOfficerAddress: string;

    async getVaultTransferRequests(fetch: FetchVaultTransferRequest): Promise<VaultTransferRequest[]> {
        const requests = (await this.axios.put("/api/vault-transfer-request", fetch)
            .then(response => response.data.requests)) as VaultTransferRequest[];
        return requests.map(request => ({
            ...request,
            legalOfficerAddress: this.legalOfficerAddress
        }));
    }

    async createVaultTransferRequest(params: CreateVaultTransferRequest): Promise<VaultTransferRequest> {
        const response = await this.axios.post('/api/vault-transfer-request', params);
        return {
            ...response.data,
            legalOfficerAddress: this.legalOfficerAddress
        };
    }

    async cancelVaultTransferRequest(requestId: string): Promise<void> {
        return await this.axios.post(`/api/vault-transfer-request/${requestId}/cancel`);
    }

    async acceptVaultTransferRequest(requestId: string): Promise<void> {
        return await this.axios.post(`/api/vault-transfer-request/${requestId}/accept`);
    }

    async rejectVaultTransferRequest(requestId: string, rejectReason: string): Promise<void> {
        return await this.axios.post(`/api/vault-transfer-request/${requestId}/reject`, { rejectReason });
    }

    async resubmitVaultTransferRequest(requestId: string): Promise<void> {
        return await this.axios.post(`/api/vault-transfer-request/${requestId}/resubmit`);
    }
}
