import { It, Mock } from 'moq.ts';
import moment from 'moment';
import { AxiosInstance, AxiosResponse } from 'axios';

import {
    rejectRequest,
    acceptRequest,
    setAssetDescription
} from './Model';

describe("Legal Officer Model", () => {

    it("Rejects one as expected", async () => {
        const signature = "signature";

        const axios = new Mock<AxiosInstance>();
        const response = new Mock<AxiosResponse>();
        axios.setup(instance => instance.post(It.IsAny(), It.IsAny())).returns(Promise.resolve(response.object()));

        await rejectRequest(axios.object(), {
            requestId: "1",
            signature,
            rejectReason: "",
            signedOn: moment()
        });

        axios.verify(instance => instance.post("/api/token-request/1/reject", It.Is<any>(request =>
            request.signature === signature
            && request.rejectReason === ""
        )));
    });

    it("Accepts one as expected", async () => {
        const signature = "signature";

        const axios = new Mock<AxiosInstance>();
        const response = new Mock<AxiosResponse>();
        response.setup(instance => instance.data).returns({sessionToken: ""});
        axios.setup(instance => instance.post(It.IsAny(), It.IsAny())).returns(Promise.resolve(response.object()));

        await acceptRequest(axios.object(), {
            requestId: "1",
            signature,
            signedOn: moment()
        });

        axios.verify(instance => instance.post("/api/token-request/1/accept", It.Is<any>(request =>
            request.signature === signature
        )));
    });

    it("Sets asset description as expected", async () => {
        const description = {
            assetId: "assetId",
            decimals: 18
        };
        const sessionToken = "token";

        const axios = new Mock<AxiosInstance>();
        const response = new Mock<AxiosResponse>();
        axios.setup(instance => instance.post(It.IsAny(), It.IsAny())).returns(Promise.resolve(response.object()));

        await setAssetDescription(axios.object(), {
            requestId: "1",
            description,
            sessionToken
        });

        axios.verify(instance => instance.post("/api/token-request/1/asset", It.Is<any>(request =>
            request.description === description
            && request.sessionToken === sessionToken
        )));
    });
});
