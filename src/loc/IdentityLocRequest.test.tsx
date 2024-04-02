import { UUID } from "@logion/node-api";
import { DraftRequest, LocsState } from "@logion/client";
import { render, waitFor, screen, getByText } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GUILLAUME, oneLegalOfficer } from "../common/TestData";
import { shallowRender, clickByName } from "../tests";
import IdentityLocRequest from "./IdentityLocRequest";
import { fillInForm } from "../components/identity/IdentityFormTestHelper";
import { setMutateLocsState, setHasValidIdentityLoc, setLocsState } from "../wallet-user/__mocks__/UserContextMock";
import { navigate, setSearchParams } from '../__mocks__/ReactRouterMock';

jest.mock('../wallet-user/UserContext');
jest.mock('../logion-chain');
jest.mock('../common/CommonContext');

describe("IdentityLocRequest", () => {

    const mutateLocsState = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();
        setMutateLocsState(mutateLocsState);
        setHasValidIdentityLoc(oneLegalOfficer);
        setSearchParams({
            get: () => undefined,
        })
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
        const locId = new UUID("a2b9dfa7-cbde-414b-8cda-cdd221a57643");
        const draftRequest = {
            locId,
            locsState: () => locsState,
            data: () => ({
                id: locId,
            }),
        } as DraftRequest;
        const locsState = {
            legalOfficersWithValidIdentityLoc: [ GUILLAUME ],
            requestIdentityLoc: () => Promise.resolve(draftRequest),
        } as unknown as LocsState;
        setLocsState(locsState);
        setMutateLocsState(async (mutator: (current: LocsState) => Promise<LocsState>): Promise<void> => {
            await mutator(locsState);
            return Promise.resolve();
        });

        render(<IdentityLocRequest backPath="back" />);

        await selectLegalOfficer();
        await fillInForm();

        await clickByName("Submit");

        await waitFor(() => expect(navigate).toBeCalledWith(`/user/loc/identity/${locId.toString()}`));
    });
})

async function selectLegalOfficer() {
    const legalOfficer1Select = screen.getByTestId('legalOfficer1Group');
    await userEvent.click(getByText(legalOfficer1Select, "Select..."));
    await waitFor(() => userEvent.click(getByText(legalOfficer1Select, "Patrick Gielen (workload: 1)")));
}
