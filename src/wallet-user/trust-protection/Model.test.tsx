import { It, Mock, Times } from "moq.ts";
import { AxiosInstance, AxiosResponse } from "axios";

import { TEST_WALLET_USER } from '../TestData';
import { DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER } from "../../common/types/LegalOfficer";

import { CreateProtectionRequest, createProtectionRequest } from "./Model";

jest.mock('../../logion-chain');
jest.mock('../../logion-chain/Signature');

const request: CreateProtectionRequest = {
    requesterAddress: TEST_WALLET_USER,
    otherLegalOfficerAddress: ANOTHER_LEGAL_OFFICER,
    userIdentity: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@logion.network",
        phoneNumber: "+1234"
    },
    userPostalAddress: {
        line1: "Place de le République Française, 10",
        line2: "boite 15",
        postalCode: "4000",
        city: "Liège",
        country: "Belgium"
    },
    isRecovery: false,
    addressToRecover: "",
}

describe("Trust Protection Model", () => {

    it("Create Protection request", async () => {
        const axios = new Mock<AxiosInstance>();
        const response = new Mock<AxiosResponse>();
        response.setup(instance => instance.data).returns({ id: '123' });
        axios.setup(instance => instance.post(It.IsAny(), It.IsAny())).returns(Promise.resolve(response.object()));

        const result = await createProtectionRequest(axios.object(), request);

        expect(result.id).toBe("123");
    });
});
