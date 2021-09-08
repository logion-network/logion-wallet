import { It, Mock } from 'moq.ts';
import { AxiosInstance, AxiosResponse } from 'axios';

import {
    FetchRequestSpecification,
    fetchRequests,
} from './Model';

describe("Common Model", () => {

    it("Fetches tokenization requests", async () => {
        const specification: FetchRequestSpecification = {
            legalOfficerAddress: "legal-officer",
            status: "PENDING",
        };

        const axios = new Mock<AxiosInstance>();
        const response = new Mock<AxiosResponse>();
        response.setup(instance => instance.data).returns({ requests: [] });
        axios.setup(instance => instance.put(It.IsAny(), It.IsAny())).returns(Promise.resolve(response.object()));

        await fetchRequests(axios.object(), specification);

        axios.verify(instance => instance.put("/api/token-request", specification));
    });
});
