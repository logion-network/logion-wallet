import { LocType, UUID } from "@logion/node-api";
import { render, screen, waitFor } from "@testing-library/react";

import { LocRequestFragment } from "../common/types/ModelTypes";
import { clickByName, typeByLabel } from "../tests";
import { TEST_WALLET_USER } from "../wallet-user/TestData";

import LocCreationDialog from "./LocCreationDialog";
import { setAuthenticatedUser } from "src/common/__mocks__/ModelMock";
import { LocData, OpenLoc, OpenLocParams, BlockchainSubmissionParams, LogionClient } from "@logion/client";
import { mockSubmittableResult } from "../logion-chain/__mocks__/SignatureMock";
import { setLocsState } from "../legal-officer/__mocks__/LegalOfficerContextMock";
import { SUCCESSFUL_SUBMISSION, setClientMock, setExtrinsicSubmissionState } from "../logion-chain/__mocks__/LogionChainMock";

jest.mock("../logion-chain/Signature");
jest.mock("../common/CommonContext");
jest.mock("../common/Model");
jest.mock("./Model");
jest.mock("../legal-officer/LegalOfficerContext");
jest.mock("../logion-chain");
jest.mock("./LocContext");

describe("LocCreationDialog", () => {

    beforeAll(() => {
        setAuthenticatedUser(TEST_WALLET_USER);
    });

    it("create Logion Identity LOC with user identity", async () => createsWithUserIdentity('Identity', undefined));
    it("create Logion Transaction LOC without user identity", async () => createsWithoutUserIdentity('Transaction', "aed4c6e4-979e-48ad-be6e-4bd39fb94762"));

    it("fails creating Logion Identity LOC with missing user identity", async () => failsWithoutUserIdentity('Identity', undefined));
    it("fails creating Logion Transaction LOC with missing user identity", async () => failsWithoutUserIdentity('Transaction', "aed4c6e4-979e-48ad-be6e-4bd39fb94762"));
})

async function createsWithUserIdentity(locType: LocType, requesterIdentityLoc: string | undefined) {
    const exit = jest.fn();
    const onSuccess = jest.fn();
    const requestFragment: LocRequestFragment = {
        requesterLocId: requesterIdentityLoc ? new UUID(requesterIdentityLoc) : undefined,
        locType,
        userIdentity: {
            firstName: "John",
            lastName: "Doe",
            email: "john@logion.network",
            phoneNumber: "+1234",
        }
    };
    mockLegalOfficerCreateLoc(requestFragment.requesterLocId || undefined);

    setExtrinsicSubmissionState(SUCCESSFUL_SUBMISSION);
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

    await waitFor(() => expect(screen.getByText("LOC successfully created.")).toBeVisible());
    await clickByName("OK");

    expect(exit).toBeCalled();
    expect(onSuccess).toBeCalled();
}

async function createsWithoutUserIdentity(locType: LocType, requesterIdentityLoc: string | undefined) {
    const exit = jest.fn();
    const onSuccess = jest.fn();
    const requestFragment: LocRequestFragment = {
        requesterLocId: requesterIdentityLoc ? new UUID(requesterIdentityLoc) : undefined,
        locType
    };
    mockLegalOfficerCreateLoc(requestFragment.requesterLocId || undefined);

    setExtrinsicSubmissionState(SUCCESSFUL_SUBMISSION);
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

async function failsWithoutUserIdentity(locType: LocType, requesterIdentityLoc: string | undefined) {
    const exit = jest.fn();
    const onSuccess = jest.fn();
    const requestFragment: LocRequestFragment = {
        requesterLocId: requesterIdentityLoc ? new UUID(requesterIdentityLoc) : undefined,
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

function mockLegalOfficerCreateLoc(requesterLocId?: UUID) {
    const locsState: any = {};
    const openLoc = {
        locId: new UUID("556f4128-4fc3-4fdc-a543-74e6230911c4"),
        data: () => ({
            ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterLocId,
            description: "LOC description",
            status: "OPEN"
        } as LocData),
        locsState,
    } as OpenLoc;
    locsState.findById = () => openLoc;

    locsState.legalOfficer = {
        createLoc: async function (params: OpenLocParams & BlockchainSubmissionParams): Promise<OpenLoc> {
            params.callback!(mockSubmittableResult(true));
            return openLoc;
        }
    };
    openLoc.locsState = () => locsState;
    setLocsState(locsState);
    const client = {
        locsState: () => Promise.resolve(locsState),
    };
    setClientMock(client as unknown as LogionClient);
}
