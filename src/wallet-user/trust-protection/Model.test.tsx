import {CreateProtectionRequest, createProtectionRequest} from "./Model";
import {mockPost} from "axios";
import moment from "moment";

jest.mock("axios");

export const TEST_WALLET_USER = "5H4MvAsobfZ6bBCDyj5dsrWYLrA8HrRzaqa9p61UXtxMhSCY";
export const DEFAULT_LEGAL_OFFICER = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"; // Alice
export const ANOTHER_LEGAL_OFFICER = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"; // Bob

test("Create Protection request", async () => {
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
        signature: 'signature',
        signedOn: moment()
    }

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
