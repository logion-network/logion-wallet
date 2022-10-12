import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { clickByName, typeByLabel } from '../../tests';
import LocCreation from './LocCreation';
import { setHasValidIdentityLoc, setMutateLocsState } from "../__mocks__/UserContextMock";
import { PATRICK, GUILLAUME } from "../../common/TestData";

jest.mock('../../common/CommonContext');
jest.mock('../../common/Model');
jest.mock('../../wallet-user/UserContext');
jest.mock('../../logion-chain');
jest.unmock("@logion/client");

const requestButtonLabel = "Request a Transaction Protection"

describe("LocCreation", () => {

    const mutateLocsState = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();
        setMutateLocsState(mutateLocsState);
    });

    it("should disable 'Submit' when user has valid id LOC but the form is empty", async () => {
        setHasValidIdentityLoc([ PATRICK ])
        await openDialog();

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
            expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
            expect(screen.getByRole("button", { name: "Request an Identity Case" })).toBeEnabled();
        });
    })

    it("should enable 'Submit' and remove 'Request an Identity Case' when an LO is selected", async () => {
        setHasValidIdentityLoc([ GUILLAUME ])
        await openDialog();

        await userEvent.click(screen.getByText("Select..."));
        await waitFor(() => userEvent.click(screen.getByText("Guillaume Grain")));

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
            expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
            expect(screen.queryByRole("button", { name: "Request an Identity Case" })).toBeNull();
        });
    })

    it("should remove 'Submit' and enable 'Request an Identity Case' when there are no LO's", async () => {
        setHasValidIdentityLoc([ ])
        await openDialog();

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
            expect(screen.queryByRole("button", { name: "Submit" })).toBeNull();
            expect(screen.getByRole("button", { name: "Request an Identity Case" })).toBeEnabled();
        });
    })

    it("should close dialog and not create a request when cancel is pressed", async () => {
        setHasValidIdentityLoc([ PATRICK ])
        await openDialog();

        const dialog = screen.getByRole("dialog");
        await clickByName("Cancel");
        await waitFor(() => expect(dialog).not.toBeInTheDocument());
    })

    it("should creates the request if the selected LO has a valid identity LOC", async () => {

        setHasValidIdentityLoc([ PATRICK, GUILLAUME ])
        await openDialog();

        const description = "description";
        await typeByLabel("Description", description)

        await userEvent.click(screen.getByText("Select..."));
        await waitFor(() => userEvent.click(screen.getByText("Patrick Gielen")));
        await clickByName("Submit");

        const dialog = screen.getByRole("dialog");
        await waitFor(() => expect(dialog).not.toBeInTheDocument());
        await waitFor(() => expect(mutateLocsState).toBeCalled());
    })

    async function openDialog() {
        render(<LocCreation locType="Transaction" requestButtonLabel={ requestButtonLabel } />);
        await clickByName(requestButtonLabel);
    }
})

