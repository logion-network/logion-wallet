import { AxiosInstance } from "axios";

import { DEFAULT_LEGAL_OFFICER } from "src/common/TestData";
import { acceptProtectionRequest, rejectProtectionRequest } from "./Model"

describe("Model", () => {

    it("rejects protection request", async () => {
        const axios = {
            post: jest.fn().mockResolvedValue(undefined),
        } as unknown as AxiosInstance;

        const requestId = "0e16421a-2550-4be5-a6a8-1ab2239b7dc4";
        await rejectProtectionRequest(axios, {
            requestId,
            legalOfficerAddress: DEFAULT_LEGAL_OFFICER.address,
            rejectReason: "Because"
        });

        expect(axios.post).toBeCalledWith(
            `/api/protection-request/${requestId}/reject`,
            expect.objectContaining({
                legalOfficerAddress: DEFAULT_LEGAL_OFFICER.address,
                rejectReason: "Because",
            })
        );
    });

    it("accepts protection request", async () => {
        const axios = {
            post: jest.fn().mockResolvedValue(undefined),
        } as unknown as AxiosInstance;

        const requestId = "0e16421a-2550-4be5-a6a8-1ab2239b7dc4";
        await acceptProtectionRequest(axios, {
            requestId,
        });

        expect(axios.post).toBeCalledWith(
            `/api/protection-request/${requestId}/accept`,
        );
    });
});
