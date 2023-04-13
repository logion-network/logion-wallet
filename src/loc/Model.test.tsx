import { UUID } from "@logion/node-api";
import { AxiosInstance } from "axios";

import { DEFAULT_LEGAL_OFFICER } from "src/common/TestData";
import { acceptLocRequest, acceptProtectionRequest, rejectLocRequest, rejectProtectionRequest } from "./Model"

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
        )
    })

    it("accepts protection request", async () => {
        const axios = {
            post: jest.fn().mockResolvedValue(undefined),
        } as unknown as AxiosInstance;

        const requestId = "0e16421a-2550-4be5-a6a8-1ab2239b7dc4";
        const identityLocId = new UUID("8f12876b-7fde-49b0-93a4-d29ed5179151");
        await acceptProtectionRequest(axios, {
            requestId,
            locId: identityLocId,
        });

        expect(axios.post).toBeCalledWith(
            `/api/protection-request/${requestId}/accept`,
            expect.objectContaining({
                locId: identityLocId.toString(),
            })
        )
    })

    it("rejects LOC request", async () => {
        const axios = {
            post: jest.fn().mockResolvedValue(undefined),
        } as unknown as AxiosInstance;

        const requestId = "0e16421a-2550-4be5-a6a8-1ab2239b7dc4";
        await rejectLocRequest(axios, {
            requestId,
            rejectReason: "Because"
        });

        expect(axios.post).toBeCalledWith(
            `/api/loc-request/${requestId}/reject`,
            expect.objectContaining({
                rejectReason: "Because",
            })
        )
    })

    it("accepts LOC request", async () => {
        const axios = {
            post: jest.fn().mockResolvedValue(undefined),
        } as unknown as AxiosInstance;

        const requestId = "0e16421a-2550-4be5-a6a8-1ab2239b7dc4";
        await acceptLocRequest(axios, {
            requestId,
        });

        expect(axios.post).toBeCalledWith(
            `/api/loc-request/${requestId}/accept`,
            expect.objectContaining({ })
        )
    })
})
