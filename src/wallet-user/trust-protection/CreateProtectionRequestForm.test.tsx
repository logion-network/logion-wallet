jest.mock('../UserContext');
jest.mock('../../logion-chain');

import {TEST_WALLET_USER} from "../Model.test";
import {DEFAULT_LEGAL_OFFICER} from "../../legal-officer/Model";
import {ANOTHER_LEGAL_OFFICER} from "./Model.test";
import {ISO_DATETIME_PATTERN} from "../../logion-chain/datetime";
import {setCreateProtectionRequest} from "../UserContext";
import {shallowRender} from "../../tests";
import React from "react";
import CreateProtectionRequestForm from "./CreateProtectionRequestForm";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";

test("renders", () => {
    const tree = shallowRender(<CreateProtectionRequestForm onSubmit={() => null}/>)
    expect(tree).toMatchSnapshot();
});

describe("CreateProtectionRequestForm", () => {

    const submitCallback = jest.fn();
    const createProtectionRequest = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();
        setCreateProtectionRequest(createProtectionRequest)
        render(<CreateProtectionRequestForm onSubmit={submitCallback}/>);
    });

    it("should display messages when an empty form is submitted", async () => {
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

        expect(submitCallback).not.toBeCalled()
    });

    it("should call submit when form is correctly filled", async  () => {
        fireEvent.input(screen.getByTestId("firstName"), {target: {value: 'John'}})
        fireEvent.input(screen.getByTestId("lastName"), {target: {value: 'Doe'}})
        fireEvent.input(screen.getByTestId("email"), {target: {value: 'john.doe@logion.network'}})
        fireEvent.input(screen.getByTestId("phoneNumber"), {target: {value: '+1234'}})

        fireEvent.input(screen.getByTestId("line1"), {target: {value: 'Place de le République Française, 10'}})
        fireEvent.input(screen.getByTestId("line2"), {target: {value: 'boite 15'}})
        fireEvent.input(screen.getByTestId("postalCode"), {target: {value: '4000'}})
        fireEvent.input(screen.getByTestId("city"), {target: {value: 'Liège'}})
        fireEvent.input(screen.getByTestId("country"), {target: {value: 'Belgium'}})

        const button = screen.getByTestId("btnSubmit");
        fireEvent.click(button);

        await waitFor(() => expect(submitCallback).toBeCalled());

        expect(createProtectionRequest).toBeCalledWith(
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
                signature: expect.stringMatching(new RegExp("protection-request,create," + ISO_DATETIME_PATTERN.source + ",John,Doe,john.doe@logion.network,[+]1234,Place de le République Française, 10,boite 15,4000,Liège,Belgium," + DEFAULT_LEGAL_OFFICER + "," + ANOTHER_LEGAL_OFFICER)),
            })
        )
    })
});
