jest.mock('../../logion-chain/Signature');
jest.mock('../UserContext');
jest.mock('../../logion-chain');
jest.mock('../../common/CommonContext');
jest.setTimeout(10000);

import { render, screen, waitFor, getByText } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GUILLAUME, PATRICK, twoLegalOfficers } from "../../common/TestData";
import { setCreateProtectionRequest, setLocsState } from "../__mocks__/UserContextMock";
import { clickByName, shallowRender } from "../../tests";
import { resetSubmitting } from "../../logion-chain/__mocks__/SignatureMock";
import { TEST_WALLET_USER2 } from "../TestData";

import CreateProtectionRequestForm from "./CreateProtectionRequestForm";
import { LocsState } from "@logion/client";

describe("CreateProtectionRequestForm", () => {

    it("renders", () => {
        const tree = shallowRender(<CreateProtectionRequestForm isRecovery={ false } />)
        expect(tree).toMatchSnapshot();
    });

    const createProtectionRequest = jest.fn();

    beforeEach(() => {
        setCreateProtectionRequest(createProtectionRequest);
    });

    it("should call submit", async  () => {
        setLocsState(LOCS_STATE);
        render(<CreateProtectionRequestForm isRecovery={ false } />);

        await selectLegalOfficers();

        await clickByName("Submit request");

        await waitFor(() => expect(createProtectionRequest).toBeCalledWith(
            expect.objectContaining({
                legalOfficers: twoLegalOfficers,
            })
        ));
    });

    it("should call submit for recovery and recovery already in progress", async  () => {
        setLocsState(LOCS_STATE);
        render(<CreateProtectionRequestForm isRecovery={ true } />);

        await userEvent.type(screen.getByLabelText("Address to Recover"), 'toRecover');

        await selectLegalOfficers();

        await clickByName("Submit request");

        await waitFor(() => expect(createProtectionRequest).toBeCalledWith(
            expect.objectContaining({
                legalOfficers: twoLegalOfficers,
            })
        ));
    });

    it("should call submit for recovery and no recovery already in progress", async  () => {
        setLocsState(LOCS_STATE);
        resetSubmitting();

        render(<CreateProtectionRequestForm isRecovery={ true } />);

        await userEvent.type(screen.getByLabelText("Address to Recover"), TEST_WALLET_USER2.address);

        await selectLegalOfficers();

        await clickByName("Submit request");

        await waitFor(() => expect(createProtectionRequest).toBeCalledWith(
            expect.objectContaining({
                legalOfficers: twoLegalOfficers,
            })
        ));
    });
});

async function selectLegalOfficers() {
    const legalOfficer1Select = screen.getByTestId('legalOfficer1Group');
    await userEvent.click(getByText(legalOfficer1Select, "Select..."));
    await waitFor(() => userEvent.click(getByText(legalOfficer1Select, "Patrick Gielen")));

    const legalOfficer2Select = screen.getByTestId('legalOfficer2Group');
    await userEvent.click(getByText(legalOfficer2Select, "Select..."));
    await waitFor(() => userEvent.click(getByText(legalOfficer2Select, "Guillaume Grain")));
}

const LOCS_STATE = {
    closedLocs: {
        "Identity": [
            {
                locId: "fda29870-3ac3-4448-9b34-7bb01a7fe2a4",
                data: () => ({ ownerAddress: PATRICK.address }),
            },
            {
                locId: "210f0bbc-fd3f-41da-8154-543f591c06eb",
                data: () => ({ ownerAddress: GUILLAUME.address }),
            }
        ]
    }
} as unknown as LocsState;
