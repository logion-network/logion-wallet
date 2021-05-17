import { FetchRequestSpecification, fetchRequests, rejectRequest, resetMock, DEFAULT_LEGAL_OFFICER } from './Model';

beforeEach(() => {
    resetMock();
});

test("Fetches pending requests", async () => {
    const specification: FetchRequestSpecification = {
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
        status: "PENDING",
    };
    const result = await fetchRequests(specification);

    expect(result.length).toBe(2);
});

test("Rejects one as expected", async () => {
    await rejectRequest("1");

    const specification: FetchRequestSpecification = {
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
        status: "REJECTED",
    };
    const result = await fetchRequests(specification);

    expect(result.length).toBe(1);
});

test("Rejects all as expected", async () => {
    await rejectRequest("1");
    await rejectRequest("2");

    const specification: FetchRequestSpecification = {
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
        status: "REJECTED",
    };
    const result = await fetchRequests(specification);

    expect(result.length).toBe(2);
});

test("Reject not found does nothing", async () => {
    await rejectRequest("42");

    const specification: FetchRequestSpecification = {
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
        status: "REJECTED",
    };
    const result = await fetchRequests(specification);

    expect(result.length).toBe(0);
});
