jest.mock("axios");
jest.mock('../../logion-chain');

import { PROTECTION_REQUEST } from "./TestData";
import { TEST_WALLET_USER } from '../TestData';
import { DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER } from "../../legal-officer/Types";
import { CreateProtectionRequest, createProtectionRequest, checkActivation } from "./Model";
import { mockPost } from "axios";
import moment from "moment";

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
    signature: 'signature',
    signedOn: moment()
}

test("Create Protection request", async () => {
    mockPost("/api/protection-request", {
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
    })

    const result = await createProtectionRequest(request);

    expect(result.id).toBe("123");
    expect(result.decisions[0].status).toBe("PENDING");
    expect(result.decisions[1].status).toBe("PENDING");
    expect(result.decisions[0].legalOfficerAddress).toBe(request.legalOfficerAddresses[0]);
    expect(result.decisions[1].legalOfficerAddress).toBe(request.legalOfficerAddresses[1]);
})

test("Check Activation of Protection Request", async () => {
    const callback = jest.fn();
    mockPost("/api/protection-request/2eb5f71c-7f31-44b5-9390-c3bf56501880/check-activation", {request}, callback)
    await checkActivation(PROTECTION_REQUEST);
    expect(callback).toBeCalled();
})
