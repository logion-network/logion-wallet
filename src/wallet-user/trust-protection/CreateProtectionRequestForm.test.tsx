jest.mock('@logion/node-api/dist/Accounts');
jest.mock('@logion/node-api/dist/Recovery');
jest.mock('../../logion-chain/Signature');
jest.mock('../UserContext');
jest.mock('../../logion-chain');
jest.mock('../../common/CommonContext');
jest.setTimeout(10000);

import { render, screen, waitFor, getByText, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER } from "../../common/TestData";
import { setCreateProtectionRequest } from "../__mocks__/UserContextMock";
import { clickByName, shallowRender } from "../../tests";
import { setActiveRecoveryInProgress } from "../../__mocks__/@logion/node-api/dist/RecoveryMock";
import { finalizeSubmission, resetSubmitting, submitting } from "../../logion-chain/__mocks__/SignatureMock";
import { TEST_WALLET_USER2 } from "../TestData";

import CreateProtectionRequestForm from "./CreateProtectionRequestForm";

test("renders", () => {
    const tree = shallowRender(<CreateProtectionRequestForm isRecovery={ false } />)
    expect(tree).toMatchSnapshot();
});

describe("CreateProtectionRequestForm", () => {

    const createProtectionRequest = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();
        setCreateProtectionRequest(createProtectionRequest);
    });

    it("should display messages when an empty form is submitted", async () => {
        render(<CreateProtectionRequestForm isRecovery={ false } />);

        await clickByName("Next");

        await waitFor(() => {
            expect(screen.getByTestId("firstNameMessage").innerHTML)
                .toBe("The first name is required")
        })

        expect(screen.getByTestId("lastNameMessage").innerHTML)
            .toBe("The last name is required");
        expect(screen.getByTestId("emailMessage").innerHTML)
            .toBe("The email is required");
        expect(screen.getByTestId("phoneNumberMessage").innerHTML)
            .toBe("The phone number is required");

        expect(screen.getByTestId("line1Message").innerHTML)
            .toBe("The line1 is required");
        expect(screen.getByTestId("line2Message").innerHTML)
            .toBe("");
        expect(screen.getByTestId("postalCodeMessage").innerHTML)
            .toBe("The postal code is required");
        expect(screen.getByTestId("cityMessage").innerHTML)
            .toBe("The city is required");
        expect(screen.getByTestId("countryMessage").innerHTML)
            .toBe("The country is required");
    });

    it("should call submit when form is correctly filled", async  () => {
        render(<CreateProtectionRequestForm isRecovery={ false } />);

        await selectLegalOfficers();
        await fillInForm();

        await clickByName("Next");

        await waitFor(() => expect(createProtectionRequest).toBeCalledWith(
            expect.arrayContaining([ DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER ]),
            expect.anything()
        ));
    });

    it("should call submit when form is correctly filled for recovery and recovery already in progress", async  () => {
        setActiveRecoveryInProgress(true);

        render(<CreateProtectionRequestForm isRecovery={ true } />);

        await userEvent.type(screen.getByLabelText("Address to Recover"), 'toRecover');
        const initiateButton = screen.getByRole('button', {name: "Initiate recovery"});
        await waitFor(() => expect(initiateButton).not.toBeDisabled());
        await userEvent.click(initiateButton);
        await waitFor(() => screen.getByText(/The recovery has been successfully initiated/));

        await selectLegalOfficers();
        await fillInForm();

        await clickByName("Next");

        await waitFor(() => expect(createProtectionRequest).toBeCalledWith(
            expect.arrayContaining([ DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER ]),
            expect.anything()
        ));
    });

    it("should call submit when form is correctly filled for recovery and no recovery already in progress", async  () => {
        setActiveRecoveryInProgress(false);
        resetSubmitting();

        render(<CreateProtectionRequestForm isRecovery={ true } />);

        await userEvent.type(screen.getByLabelText("Address to Recover"), TEST_WALLET_USER2);
        const initiateButton = screen.getByRole('button', {name: "Initiate recovery"});
        await waitFor(() => expect(initiateButton).not.toBeDisabled());
        await userEvent.click(initiateButton);
        await waitFor(() => expect(submitting()).toBe(true));
        act(() => finalizeSubmission());
        await waitFor(() => screen.getByText(/The recovery has been successfully initiated/));

        await selectLegalOfficers();
        await fillInForm();

        await clickByName("Next");

        let dialog: HTMLElement;
        await waitFor(() => dialog = screen.getByRole("dialog"));
        await clickByName("OK");

        expect(createProtectionRequest).toBeCalledWith(
            expect.arrayContaining([ DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER ]),
            expect.anything()
        );
    });
});

async function fillInForm() {
    await userEvent.type(screen.getByTestId("firstName"), 'John');
    await userEvent.type(screen.getByTestId("lastName"), 'Doe')
    await userEvent.type(screen.getByTestId("email"), 'john.doe@logion.network')
    await userEvent.type(screen.getByTestId("phoneNumber"), '+1234')

    await userEvent.type(screen.getByTestId("line1"), 'Place de le République Française, 10')
    await userEvent.type(screen.getByTestId("line2"), 'boite 15')
    await userEvent.type(screen.getByTestId("postalCode"), '4000')
    await userEvent.type(screen.getByTestId("city"), 'Liège')
    await userEvent.type(screen.getByTestId("country"), 'Belgium')

    await userEvent.click(screen.getByRole('checkbox'));
}

async function selectLegalOfficers() {
    const legalOfficer1Select = screen.getByTestId('legalOfficer1Group');
    await userEvent.click(getByText(legalOfficer1Select, "Select..."));
    await waitFor(() => userEvent.click(getByText(legalOfficer1Select, "Patrick Gielen")));

    const legalOfficer2Select = screen.getByTestId('legalOfficer2Group');
    await userEvent.click(getByText(legalOfficer2Select, "Select..."));
    await waitFor(() => userEvent.click(getByText(legalOfficer2Select, "Guillaume Grain")));
}