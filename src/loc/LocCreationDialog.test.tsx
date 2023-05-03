import { LocType } from "@logion/node-api";
import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { Compact, u128 } from "@polkadot/types-codec";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LocRequestFragment } from "../common/types/ModelTypes";
import { finalizeSubmission } from "../logion-chain/__mocks__/SignatureMock";
import { clickByName, typeByLabel } from "../tests";
import { TEST_WALLET_USER } from "../wallet-user/TestData";

import LocCreationDialog from "./LocCreationDialog";
import { setAuthenticatedUser } from "src/common/__mocks__/ModelMock";
import { It, Mock } from "moq.ts";
import { setupApiMock } from "src/__mocks__/LogionMock";

jest.mock("../logion-chain/Signature");
jest.mock("../common/CommonContext");
jest.mock("../common/Model");
jest.mock("./Model");
jest.mock("../legal-officer/LegalOfficerContext");
jest.mock("../logion-chain");

describe("LocCreationDialog", () => {

    beforeAll(() => {
        setAuthenticatedUser(TEST_WALLET_USER);
    });
  
    it("create Polkadot Identity LOC with user identity", async () => createsWithUserIdentity('Identity', TEST_WALLET_USER.address, undefined));
    it("create Logion Identity LOC with user identity", async () => createsWithUserIdentity('Identity', undefined, undefined));
    it("create Polkadot Transaction LOC with user identity", async () => createsWithUserIdentity('Transaction', TEST_WALLET_USER.address, undefined));
    it("create Logion Transaction LOC with user identity", async () => createsWithUserIdentity('Transaction', undefined, "aed4c6e4-979e-48ad-be6e-4bd39fb94762"));

    it("create Polkadot Identity LOC without user identity", async () => createsWithoutUserIdentity('Identity', TEST_WALLET_USER.address, undefined));
    it("create Logion Identity LOC without user identity", async () => createsWithoutUserIdentity('Identity', undefined, undefined));
    it("create Polkadot Transaction LOC without user identity", async () => createsWithoutUserIdentity('Transaction', TEST_WALLET_USER.address, undefined));
    it("create Logion Transaction LOC without user identity", async () => createsWithoutUserIdentity('Transaction', undefined, "aed4c6e4-979e-48ad-be6e-4bd39fb94762"));

    it("fails creating Polkadot Identity LOC with missing user identity", async () => failsWithoutUserIdentity('Identity', TEST_WALLET_USER.address, undefined));
    it("fails creating Logion Identity LOC with missing user identity", async () => failsWithoutUserIdentity('Identity', undefined, undefined));
    it("fails creating Polkadot Transaction LOC with missing user identity", async () => failsWithoutUserIdentity('Transaction', TEST_WALLET_USER.address, undefined));
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
            phoneNumber: "+1234",
        }
    };
    setupApiMock(api => {
        const locId = new Mock<Compact<u128>>();
        api.setup(instance => instance.adapters.toLocId(It.IsAny())).returns(locId.object());
        if(locType === "Identity") {
            const submittable = new Mock<SubmittableExtrinsic<"promise">>();
            api.setup(instance => instance.polkadot.tx.logionLoc.createPolkadotIdentityLoc(It.IsAny(), It.IsAny())).returns(submittable.object());
        } else if(locType === "Collection") {
            const submittable = new Mock<SubmittableExtrinsic<"promise">>();
            api.setup(instance => instance.polkadot.tx.logionLoc.createCollectionLoc(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny())).returns(submittable.object());
        } else if(locType === "Transaction") {
            const submittable = new Mock<SubmittableExtrinsic<"promise">>();
            api.setup(instance => instance.polkadot.tx.logionLoc.createPolkadotTransactionLoc(It.IsAny(), It.IsAny())).returns(submittable.object());
        }
    });

    render(<LocCreationDialog
        exit={ exit }
        hasLinkNature={ false }
        onSuccess={ onSuccess }
        show={ true }
        locRequest={ requestFragment }
    />);

    await selectProjectType();
    await typeByLabel("LOC Private Description", "Test");

    await submitAndExpectSuccess(exit, onSuccess);
}

async function selectProjectType() {
    await userEvent.click(screen.getByText("Please select your project type"));
    await userEvent.click(screen.getByText("Custom LOC"));
    await clickByName("Submit");
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

    await selectProjectType();
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

    await selectProjectType();
    await typeByLabel("LOC Private Description", "Test");

    await submitAndExpectFailure(exit, onSuccess);
}

async function submitAndExpectFailure(exit: jest.Mock<any, any>, onSuccess: jest.Mock<any, any>) {
    await clickByName("Submit");
    await waitFor(() => expect(screen.queryAllByText(/is required/).length).toBe(4));

    expect(exit).not.toBeCalled();
    expect(onSuccess).not.toBeCalled();
}
