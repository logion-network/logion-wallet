import { FetchVaultTransferRequest, VaultTransferRequest } from "@logion/client";
import { AxiosInstance } from "axios";
import { ValidAccountId } from "@logion/node-api";

export class VaultApi {

    constructor(axios: AxiosInstance, legalOfficerAccountId: ValidAccountId) {
        this.axios = axios;
        this.legalOfficerAccountId = legalOfficerAccountId;
    }

    private axios: AxiosInstance;

    private readonly legalOfficerAccountId: ValidAccountId;

    async getVaultTransferRequests(fetch: FetchVaultTransferRequest & { legalOfficerAddress: string }): Promise<VaultTransferRequest[]> {
        const requests = (await this.axios.put("/api/vault-transfer-request", fetch)
            .then(response => response.data.requests)) as VaultTransferRequest[];
        return requests.map(request => ({
            ...request,
            legalOfficerAddress: this.legalOfficerAccountId.address
        }));
    }

    async acceptVaultTransferRequest(requestId: string): Promise<void> {
        return await this.axios.post(`/api/vault-transfer-request/${requestId}/accept`);
    }

    async rejectVaultTransferRequest(requestId: string, rejectReason: string): Promise<void> {
        return await this.axios.post(`/api/vault-transfer-request/${requestId}/reject`, { rejectReason });
    }
}
