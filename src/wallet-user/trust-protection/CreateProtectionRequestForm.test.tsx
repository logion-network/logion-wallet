jest.mock('../UserContext');
jest.mock('../../logion-chain');
jest.mock('../../logion-chain/Signature');
jest.mock('../../common/RootContext');

import { TEST_WALLET_USER } from '../TestData';
import { DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER } from "../../common/types/LegalOfficer";
import { ISO_DATETIME_PATTERN } from "../../logion-chain/datetime";
import { setCreateProtectionRequest } from "../__mocks__/UserContextMock";
import { shallowRender } from "../../tests";
import React from "react";
import CreateProtectionRequestForm from "./CreateProtectionRequestForm";
import { render, screen, fireEvent, waitFor, getByText } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
        const button = screen.getByTestId("btnSubmit");
        fireEvent.click(button)

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

        const legalOfficer1Select = screen.getByTestId('legalOfficer1Group');
        userEvent.click(getByText(legalOfficer1Select, "Select..."));
        await waitFor(() => userEvent.click(getByText(legalOfficer1Select, "Patrick Gielen")));

        const legalOfficer2Select = screen.getByTestId('legalOfficer2Group');
        userEvent.click(getByText(legalOfficer2Select, "Select..."));
        await waitFor(() => userEvent.click(getByText(legalOfficer2Select, "Guillaume Grain")));

        fireEvent.input(screen.getByTestId("firstName"), {target: {value: 'John'}})
        fireEvent.input(screen.getByTestId("lastName"), {target: {value: 'Doe'}})
        fireEvent.input(screen.getByTestId("email"), {target: {value: 'john.doe@logion.network'}})
        fireEvent.input(screen.getByTestId("phoneNumber"), {target: {value: '+1234'}})

        fireEvent.input(screen.getByTestId("line1"), {target: {value: 'Place de le République Française, 10'}})
        fireEvent.input(screen.getByTestId("line2"), {target: {value: 'boite 15'}})
        fireEvent.input(screen.getByTestId("postalCode"), {target: {value: '4000'}})
        fireEvent.input(screen.getByTestId("city"), {target: {value: 'Liège'}})
        fireEvent.input(screen.getByTestId("country"), {target: {value: 'Belgium'}})

        userEvent.click(screen.getByRole('checkbox'));

        const button = screen.getByTestId("btnSubmit");
        fireEvent.click(button);

        await waitFor(() => expect(createProtectionRequest).toBeCalledWith(
            expect.objectContaining({
                requesterAddress: TEST_WALLET_USER,
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
                legalOfficerAddresses: [DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER],
                signature: expect.stringMatching(new RegExp("protection-request,create," + ISO_DATETIME_PATTERN.source + ",John,Doe,john.doe@logion.network,[+]1234,Place de le République Française, 10,boite 15,4000,Liège,Belgium,false,," + DEFAULT_LEGAL_OFFICER + "," + ANOTHER_LEGAL_OFFICER)),
            })
        ));
    });

    it("should call submit when form is correctly filled for recovery", async  () => {
        render(<CreateProtectionRequestForm isRecovery={ true } />);

        userEvent.type(screen.getByTestId("addressToRecover"), 'toRecover');
        userEvent.click(screen.getByRole('button', {name: "Initiate recovery"}));

        const legalOfficer1Select = screen.getByTestId('legalOfficer1Group');
        userEvent.click(getByText(legalOfficer1Select, "Select..."));
        await waitFor(() => userEvent.click(getByText(legalOfficer1Select, "Patrick Gielen")));

        const legalOfficer2Select = screen.getByTestId('legalOfficer2Group');
        userEvent.click(getByText(legalOfficer2Select, "Select..."));
        await waitFor(() => userEvent.click(getByText(legalOfficer2Select, "Guillaume Grain")));

        fireEvent.input(screen.getByTestId("firstName"), {target: {value: 'John'}})
        fireEvent.input(screen.getByTestId("lastName"), {target: {value: 'Doe'}})
        fireEvent.input(screen.getByTestId("email"), {target: {value: 'john.doe@logion.network'}})
        fireEvent.input(screen.getByTestId("phoneNumber"), {target: {value: '+1234'}})

        fireEvent.input(screen.getByTestId("line1"), {target: {value: 'Place de le République Française, 10'}})
        fireEvent.input(screen.getByTestId("line2"), {target: {value: 'boite 15'}})
        fireEvent.input(screen.getByTestId("postalCode"), {target: {value: '4000'}})
        fireEvent.input(screen.getByTestId("city"), {target: {value: 'Liège'}})
        fireEvent.input(screen.getByTestId("country"), {target: {value: 'Belgium'}})

        userEvent.click(screen.getByRole('checkbox'));

        const button = screen.getByTestId("btnSubmit");
        fireEvent.click(button);

        await waitFor(() => expect(createProtectionRequest).toBeCalledWith(
            expect.objectContaining({
                requesterAddress: TEST_WALLET_USER,
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
                legalOfficerAddresses: [DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER],
                signature: expect.stringMatching(new RegExp("protection-request,create," + ISO_DATETIME_PATTERN.source + ",John,Doe,john.doe@logion.network,[+]1234,Place de le République Française, 10,boite 15,4000,Liège,Belgium,true,toRecover," + DEFAULT_LEGAL_OFFICER + "," + ANOTHER_LEGAL_OFFICER)),
            })
        ));
    });
});
