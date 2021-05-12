import { FetchRequestSpecification, fetchRequests, rejectRequest, resetMock } from './Model';

beforeEach(() => {
    resetMock();
});

test("Fetches pending requests", async () => {
    const specification: FetchRequestSpecification = {
        legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        status: "PENDING",
    };
    const result = await fetchRequests(specification);

    expect(result.length).toBe(2);
});

test("Rejects as expected", async () => {
    await rejectRequest("1");

    const specification: FetchRequestSpecification = {
        legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        status: "REJECTED",
    };
    const result = await fetchRequests(specification);

    expect(result.length).toBe(1);
});

test("Reject not found does nothing", async () => {
    await rejectRequest("42");

    const specification: FetchRequestSpecification = {
        legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        status: "REJECTED",
    };
    const result = await fetchRequests(specification);

    expect(result.length).toBe(0);
});
