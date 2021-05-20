import {CreateTokenRequest, createTokenRequest} from "./Model";
import {DEFAULT_LEGAL_OFFICER} from "../legal-officer/Model";
import {mockPost} from "axios";

jest.mock("axios");

export const TEST_WALLET_USER = "5H4MvAsobfZ6bBCDyj5dsrWYLrA8HrRzaqa9p61UXtxMhSCY";

test("Create Tokenization request", async () => {
    const request: CreateTokenRequest = {
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
        requestedTokenName: 'TestToken',
        requesterAddress: TEST_WALLET_USER,
        bars: 10
    }

    mockPost("/api/token-request", {
        id: 123,
        legalOfficerAddress: request.legalOfficerAddress,
        requestedTokenName: request.requestedTokenName,
        requesterAddress: request.requesterAddress,
        bars: request.bars
    })

    const result = await createTokenRequest(request);

    expect(result.id).toBe(123);
    expect(result.legalOfficerAddress).toBe(request.legalOfficerAddress);
    expect(result.requestedTokenName).toBe(request.requestedTokenName);
    expect(result.requesterAddress).toBe(request.requesterAddress);
    expect(result.bars).toBe(request.bars);
})
