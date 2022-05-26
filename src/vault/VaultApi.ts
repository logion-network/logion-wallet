import { FetchVaultTransferRequest, VaultTransferRequest } from "@logion/client/dist/VaultClient";
import { AxiosInstance } from "axios";

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

    async acceptVaultTransferRequest(requestId: string): Promise<void> {
        return await this.axios.post(`/api/vault-transfer-request/${requestId}/accept`);
    }

    async rejectVaultTransferRequest(requestId: string, rejectReason: string): Promise<void> {
        return await this.axios.post(`/api/vault-transfer-request/${requestId}/reject`, { rejectReason });
    }
}
