import { render, screen, waitFor } from "@testing-library/react";
import { LocType } from "@logion/node-api/dist/Types";

import { LocRequestFragment } from "../common/types/ModelTypes";
import { finalizeSubmission } from "../logion-chain/__mocks__/SignatureMock";
import { clickByName, typeByLabel } from "../tests";
import { TEST_WALLET_USER } from "../wallet-user/TestData";

import LocCreationDialog from "./LocCreationDialog";

jest.mock("@logion/node-api/dist/LogionLoc");
jest.mock("../logion-chain/Signature");
jest.mock("../common/CommonContext");
jest.mock("../common/Model");
jest.mock("../legal-officer/LegalOfficerContext");

describe("LocCreationDialog", () => {
  
    it("create Polkadot Identity LOC with user identity", async () => createsWithUserIdentity('Identity', TEST_WALLET_USER, undefined));
    it("create Logion Identity LOC with user identity", async () => createsWithUserIdentity('Identity', undefined, undefined));
    it("create Polkadot Transaction LOC with user identity", async () => createsWithUserIdentity('Transaction', TEST_WALLET_USER, undefined));
    it("create Logion Transaction LOC with user identity", async () => createsWithUserIdentity('Transaction', undefined, "aed4c6e4-979e-48ad-be6e-4bd39fb94762"));

    it("create Polkadot Identity LOC without user identity", async () => createsWithoutUserIdentity('Identity', TEST_WALLET_USER, undefined));
    it("create Logion Identity LOC without user identity", async () => createsWithoutUserIdentity('Identity', undefined, undefined));
    it("create Polkadot Transaction LOC without user identity", async () => createsWithoutUserIdentity('Transaction', TEST_WALLET_USER, undefined));
    it("create Logion Transaction LOC without user identity", async () => createsWithoutUserIdentity('Transaction', undefined, "aed4c6e4-979e-48ad-be6e-4bd39fb94762"));

    it("fails creating Polkadot Identity LOC with missing user identity", async () => failsWithoutUserIdentity('Identity', TEST_WALLET_USER, undefined));
    it("fails creating Logion Identity LOC with missing user identity", async () => failsWithoutUserIdentity('Identity', undefined, undefined));
    it("fails creating Polkadot Transaction LOC with missing user identity", async () => failsWithoutUserIdentity('Transaction', TEST_WALLET_USER, undefined));
    it("fails creating Logion Transaction LOC with missing user identity", async () => failsWithoutUserIdentity('Transaction', undefined, "aed4c6e4-979e-48ad-be6e-4bd39fb94762"));
})

async function createsWithUserIdentity(locType: LocType, requesterAddress: string | undefined, requesterIdentityLoc: string | undefined) {
    const exit = jest.fn();
    const onSuccess = jest.fn();
    const requestFragment: LocRequestFragment = {
        requesterAddress,
        requesterIdentityLoc,
        locType,
        userIdentity: {
            firstName: "John",
            lastName: "Doe",
            email: "john@logion.network",
            phoneNumber: "+1234"
        }
    };

    render(<LocCreationDialog
        exit={ exit }
        hasLinkNature={ false }
        onSuccess={ onSuccess }
        show={ true }
        locRequest={ requestFragment }
    />);

    await typeByLabel("LOC Private Description", "Test");

    await submitAndExpectSuccess(exit, onSuccess);
}

async function submitAndExpectSuccess(exit: jest.Mock<any, any>, onSuccess: jest.Mock<any, any>) {
    await clickByName("Submit");
    await waitFor(() => expect(screen.getByText("Submitting...")).toBeVisible());
    finalizeSubmission();

    await waitFor(() => expect(screen.getByText("LOC successfully created.")).toBeVisible());
    await clickByName("OK");

    expect(exit).toBeCalled();
    expect(onSuccess).toBeCalled();
}

async function createsWithoutUserIdentity(locType: LocType, requesterAddress: string | undefined, requesterIdentityLoc: string | undefined) {
    const exit = jest.fn();
    const onSuccess = jest.fn();
    const requestFragment: LocRequestFragment = {
        requesterAddress,
        requesterIdentityLoc,
        locType
    };

    render(<LocCreationDialog
        exit={ exit }
        hasLinkNature={ false }
        onSuccess={ onSuccess }
        show={ true }
        locRequest={ requestFragment }
    />);

    await typeByLabel("LOC Private Description", "Test");
    await fillInUserIdentityForm();

    await submitAndExpectSuccess(exit, onSuccess);
}

async function fillInUserIdentityForm() {
    await typeByLabel("First Name", "John");
    await typeByLabel("Last Name", "Doe");
    await typeByLabel("E-mail", "john@logion.network");
    await typeByLabel("Phone", "+1234");
}

async function failsWithoutUserIdentity(locType: LocType, requesterAddress: string | undefined, requesterIdentityLoc: string | undefined) {
    const exit = jest.fn();
    const onSuccess = jest.fn();
    const requestFragment: LocRequestFragment = {
        requesterAddress,
        requesterIdentityLoc,
        locType,
    };

    render(<LocCreationDialog
        exit={ exit }
        hasLinkNature={ false }
        onSuccess={ onSuccess }
        show={ true }
        locRequest={ requestFragment }
    />);

    await typeByLabel("LOC Private Description", "Test");

    await submitAndExpectFailure(exit, onSuccess);
}

async function submitAndExpectFailure(exit: jest.Mock<any, any>, onSuccess: jest.Mock<any, any>) {
    await clickByName("Submit");
    await waitFor(() => expect(screen.queryAllByText(/is required/).length).toBe(4));

    expect(exit).not.toBeCalled();
    expect(onSuccess).not.toBeCalled();
}
