import axios, { AxiosInstance } from "axios";
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

    constructor() {
        this.axios = axios.create();
    }

    private axios: AxiosInstance;

    async getLegalOfficers(): Promise<LegalOfficer[]> {
        const legalOfficers = (await this.axios.get(config.directory + "/legal-officer")
            .then(response => response.data.legalOfficers)) as LegalOfficer[];
        return legalOfficers.filter(legalOfficer => legalOfficer.node).map(data => ({
                ...data,
                name: `${data.userIdentity.firstName} ${data.userIdentity.lastName}`
            }));
    }
}
