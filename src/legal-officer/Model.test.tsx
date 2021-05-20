jest.mock("axios");

import { FetchRequestSpecification, fetchRequests, rejectRequest, DEFAULT_LEGAL_OFFICER } from './Model';
import { mockPut, mockPost } from "axios";

test("Fetches pending requests", async () => {
    const specification: FetchRequestSpecification = {
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
        status: "PENDING",
    };
    mockPut("/api/token-request", {
        requests: [{}, {}]
    });

    const result = await fetchRequests(specification);

    expect(result.length).toBe(2);
});

test("Rejects one as expected", async () => {
    const rejectCallback = jest.fn();
    mockPost("/api/token-request/1/reject", {}, rejectCallback);
    await rejectRequest("1");
    expect(rejectCallback).toBeCalled();
});
