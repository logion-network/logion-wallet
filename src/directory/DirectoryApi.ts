import axios, { AxiosInstance } from "axios";
import { buildAuthenticatedAxios } from "../common/api";
import UserIdentity from "../common/types/Identity";
import PostalAddress from "../common/types/PostalAddress";
import config from "../config";

export interface LegalOfficer {
    userIdentity: UserIdentity,
    postalAddress: PostalAddress,
    address: string,
    additionalDetails: string,
    node: string,
    name: string,
}

export class DirectoryApi {

    constructor(token?: string) {
        if(token) {
            this.axios = buildAuthenticatedAxios(config.directory, token);
        } else {
            this.axios = axios.create({ baseURL: config.directory });
        }
    }

    private axios: AxiosInstance;

    async getLegalOfficers(): Promise<LegalOfficer[]> {
        const legalOfficers = (await this.axios.get("/api/legal-officer")
            .then(response => response.data.legalOfficers)) as LegalOfficer[];
        return legalOfficers.map(data => ({
                ...data,
                name: `${data.userIdentity.firstName} ${data.userIdentity.lastName}`
            }));
    }

    async createOrUpdate(legalOfficer: LegalOfficer) {
        await this.axios.put('/api/legal-officer', legalOfficer);
    }
}
