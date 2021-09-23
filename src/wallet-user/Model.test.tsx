import { It, Mock } from "moq.ts";
import { AxiosInstance, AxiosResponse } from "axios";

import { CreateTokenRequest, createTokenRequest } from "./Model";
import { TEST_WALLET_USER } from './TestData';
import { DEFAULT_LEGAL_OFFICER } from "../common/types/LegalOfficer";

describe("Wallet User Model", () => {

    it("Create Tokenization request", async () => {
        const request: CreateTokenRequest = {
            legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
            requestedTokenName: 'TestToken',
            requesterAddress: TEST_WALLET_USER,
            bars: 10,
        }

        const axios = new Mock<AxiosInstance>();
        const response = new Mock<AxiosResponse>();
        response.setup(instance => instance.data).returns({
            id: '123',
            legalOfficerAddress: request.legalOfficerAddress,
            requestedTokenName: request.requestedTokenName,
            requesterAddress: request.requesterAddress,
            bars: request.bars
        });
        axios.setup(instance => instance.post(It.IsAny(), It.IsAny())).returns(Promise.resolve(response.object()));

        const result = await createTokenRequest(axios.object(), request);

        expect(result.id).toBe("123");
        expect(result.legalOfficerAddress).toBe(request.legalOfficerAddress);
        expect(result.requestedTokenName).toBe(request.requestedTokenName);
        expect(result.requesterAddress).toBe(request.requesterAddress);
        expect(result.bars).toBe(request.bars);
    });
});
