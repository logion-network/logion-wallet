jest.mock('@logion/node-api/dist/Accounts');
jest.mock('../UserContext');
jest.mock('../../logion-chain');
jest.mock('../../common/CommonContext');
jest.setTimeout(10000);

import { shallowRender, clickByName } from "../../tests";
import IdentityLocRequest from "./IdentityLocRequest";
import { render, waitFor, screen, getByText } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fillInForm } from "../../components/identity/IdentityFormTestHelper";
import { setMutateLocsState } from "../__mocks__/UserContextMock";

describe("IdentityLocRequest", () => {

    const mutateLocsState = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();
        setMutateLocsState(mutateLocsState);
    });

    it("renders", () => {
        const tree = shallowRender(<IdentityLocRequest backPath="back" />)
        expect(tree).toMatchSnapshot();
    })

    it("should display messages when an empty form is submitted", async () => {
        render(<IdentityLocRequest backPath="back" />);

        let agree: HTMLElement;
        await waitFor(() => agree = screen.getByTestId("agree"));
        await userEvent.click(agree!);

        await clickByName("Submit");

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
        render(<IdentityLocRequest backPath="back" />);

        await selectLegalOfficer();
        await fillInForm();

        await clickByName("Submit");

        await waitFor(() => expect(mutateLocsState).toBeCalled());
    });
})

async function selectLegalOfficer() {
    const legalOfficer1Select = screen.getByTestId('legalOfficer1Group');
    await userEvent.click(getByText(legalOfficer1Select, "Select..."));
    await waitFor(() => userEvent.click(getByText(legalOfficer1Select, "Patrick Gielen")));
}
