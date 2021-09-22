import { It, Mock } from 'moq.ts';
import { AxiosInstance, AxiosResponse } from 'axios';

import { rejectRequest, acceptRequest, setAssetDescription } from './Model';

describe("Legal Officer Model", () => {

    it("Rejects one as expected", async () => {

        const axios = new Mock<AxiosInstance>();
        const response = new Mock<AxiosResponse>();
        axios.setup(instance => instance.post(It.IsAny(), It.IsAny())).returns(Promise.resolve(response.object()));

        await rejectRequest(axios.object(), {
            requestId: "1",
            rejectReason: "",
        });

        axios.verify(instance => instance.post("/api/token-request/1/reject", It.Is<any>(request =>
            request.rejectReason === ""
        )));
    });

    it("Accepts one as expected", async () => {

        const axios = new Mock<AxiosInstance>();
        const response = new Mock<AxiosResponse>();
        response.setup(instance => instance.data).returns({sessionToken: ""});
        axios.setup(instance => instance.post(It.IsAny())).returns(Promise.resolve(response.object()));

        await acceptRequest(axios.object(), {
            requestId: "1",
        });

        axios.verify(instance => instance.post("/api/token-request/1/accept"));
    });

    it("Sets asset description as expected", async () => {
        const description = {
            assetId: "assetId",
            decimals: 18
        };

        const axios = new Mock<AxiosInstance>();
        const response = new Mock<AxiosResponse>();
        axios.setup(instance => instance.post(It.IsAny(), It.IsAny())).returns(Promise.resolve(response.object()));

        await setAssetDescription(axios.object(), {
            requestId: "1",
            description,
        });

        axios.verify(instance => instance.post("/api/token-request/1/asset", It.Is<any>(request =>
            request.description === description
        )));
    });
});
