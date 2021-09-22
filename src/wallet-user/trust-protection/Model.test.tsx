import { It, Mock } from "moq.ts";
import { AxiosInstance, AxiosResponse } from "axios";

import { PROTECTION_REQUEST } from "./TestData";
import { TEST_WALLET_USER } from '../TestData';
import { DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER } from "../../common/types/LegalOfficer";

import { CreateProtectionRequest, createProtectionRequest, checkActivation } from "./Model";

jest.mock('../../logion-chain');
jest.mock('../../logion-chain/Signature');

const request: CreateProtectionRequest = {
    requesterAddress: TEST_WALLET_USER,
    legalOfficerAddresses: [DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER],
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
        response.setup(instance => instance.data).returns({
            id: '123',
            decisions: [
                {
                    legalOfficerAddress: request.legalOfficerAddresses[0],
                    status: "PENDING"
                },
                {
                    legalOfficerAddress: request.legalOfficerAddresses[1],
                    status: "PENDING"
                }
            ]
        });
        axios.setup(instance => instance.post(It.IsAny(), It.IsAny())).returns(Promise.resolve(response.object()));

        const result = await createProtectionRequest(axios.object(), request);

        expect(result.id).toBe("123");
        expect(result.decisions[0].status).toBe("PENDING");
        expect(result.decisions[1].status).toBe("PENDING");
        expect(result.decisions[0].legalOfficerAddress).toBe(request.legalOfficerAddresses[0]);
        expect(result.decisions[1].legalOfficerAddress).toBe(request.legalOfficerAddresses[1]);
    });

    it("Check Activation of Protection Request", async () => {
        const axios = new Mock<AxiosInstance>();
        const response = new Mock<AxiosResponse>();
        axios.setup(instance => instance.post(It.IsAny(), It.IsAny())).returns(Promise.resolve(response.object()));

        await checkActivation(axios.object(), PROTECTION_REQUEST);

        axios.verify(instance => instance.post(
                "/api/protection-request/2eb5f71c-7f31-44b5-9390-c3bf56501880/check-activation",
                It.Is<any>(_request =>
             _request.userAddress === request.requesterAddress
        )));
    });
});
