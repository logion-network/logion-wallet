jest.mock("axios");

import {
    FetchRequestSpecification,
    fetchRequests,
} from './Model';
import { mockPut } from "../__mocks__/AxiosMock";

test("Fetches pending requests", async () => {
    const specification: FetchRequestSpecification = {
        legalOfficerAddress: "legal-officer",
        status: "PENDING",
    };
    mockPut("/api/token-request", {
        requests: [{}, {}]
    });

    const result = await fetchRequests(specification);

    expect(result.length).toBe(2);
});
