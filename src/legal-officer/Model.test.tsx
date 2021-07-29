jest.mock("axios");

import {
    rejectRequest,
    acceptRequest,
    setAssetDescription
} from './Model';
import { mockPost } from "../__mocks__/AxiosMock";
import moment from 'moment';

test("Rejects one as expected", async () => {
    const rejectCallback = jest.fn();
    const signature = "signature";
    const legalOfficerAddress = "legalOfficerAddress";
    mockPost("/api/token-request/1/reject", { signature, legalOfficerAddress }, rejectCallback);
    await rejectRequest({
        requestId: "1",
        signature,
        rejectReason: "",
        signedOn: moment()
    });
    expect(rejectCallback).toBeCalled();
});

test("Accepts one as expected", async () => {
    const acceptCallback = jest.fn();
    const signature = "signature";
    const legalOfficerAddress = "legalOfficerAddress";
    mockPost("/api/token-request/1/accept", { signature, legalOfficerAddress }, acceptCallback);
    await acceptRequest({
        requestId: "1",
        signature,
        signedOn: moment()
    });
    expect(acceptCallback).toBeCalled();
});

test("Sets asset description as expected", async () => {
    const callback = jest.fn();
    const description = {
        assetId: "assetId",
        decimals: 18
    };
    const sessionToken = "token";
    mockPost("/api/token-request/1/asset", { description, sessionToken }, callback);
    await setAssetDescription({
        requestId: "1",
        description,
        sessionToken
    });
    expect(callback).toBeCalled();
});
