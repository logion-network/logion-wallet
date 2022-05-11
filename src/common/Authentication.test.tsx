import { AxiosInstance, AxiosResponse } from "axios";
import { It, Mock } from "moq.ts";
import { ISO_DATETIME_PATTERN } from "@logion/node-api/dist/datetime";

import { authenticate } from './Authentication';

jest.mock('../logion-chain/Signature');

type AuthenticateRequestFragment = {signatures: Record<string, {signature: string}>};

describe("Authentication", () => {

    it("authenticates", async () => {

        const axiosMock = new Mock<AxiosInstance>();

        const sessionId = "session";
        const addresses = [ "abc" ];
        const signInResponseMock = new Mock<AxiosResponse>();
        signInResponseMock.setup(instance => instance.data).returns({
            sessionId
        });
        axiosMock.setup(instance => instance.post(
            "/api/auth/sign-in",
            It.Is<{addresses: string[]}>(request => request.addresses === addresses))
        ).returns(Promise.resolve(signInResponseMock.object()));

        const authenticateResponseMock = new Mock<AxiosResponse>();
        authenticateResponseMock.setup(instance => instance.data).returns({
            tokens: {
                "abc": { value: "token", expiredOn: "2121-06-01T12:13:34.678" }
            }
        });
        const mockSignatureRegExp = new RegExp("authentication,login," + ISO_DATETIME_PATTERN.source + ",session");
        axiosMock.setup(instance => instance.post(
            "/api/auth/session/authenticate",
            It.Is<AuthenticateRequestFragment>(request => mockSignatureRegExp.test(request.signatures.abc.signature)))
        ).returns(Promise.resolve(authenticateResponseMock.object()));

        const tokens = await authenticate(axiosMock.object(), addresses);

        expect(tokens.get("abc")!.value).toBe("token");
    });
});
