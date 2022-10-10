import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { clickByName, typeByLabel } from '../../tests';
import LocCreation from './LocCreation';
import { PATRICK } from "../../common/TestData";
import { setHasValidIdentityLoc } from "../__mocks__/UserContextMock";

jest.mock('../../common/CommonContext');
jest.mock('../../common/Model');
jest.mock('../../wallet-user/UserContext');
jest.mock('../../logion-chain');
jest.unmock("@logion/client");

const requestButtonLabel = "Request a Transaction Protection"

describe("LocCreation", () => {

    it("should disable submit when the form is empty", async () => {
        await openDialog();

        await waitFor(() => expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled());
    })

    it("should disable submit when the selected LO has no valid identity LOC", async () => {
        await openDialog();

        await userEvent.click(screen.getByText("Select..."));
        await waitFor(() => userEvent.click(screen.getByText("Guillaume Grain")));
        await waitFor(() => expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled());
    })

    it("should close dialog and not create token when cancel is pressed", async () => {
        await openDialog();

        const dialog = screen.getByRole("dialog");
        await clickByName("Cancel");
        await waitFor(() => expect(dialog).not.toBeInTheDocument());
    })

    it("should creates the request if the selected LO has a valid identity LOC", async () => {

        setHasValidIdentityLoc(PATRICK);

        await openDialog();

        const description = "description";
        await typeByLabel("Description", description)

        await userEvent.click(screen.getByText("Select..."));
        await waitFor(() => userEvent.click(screen.getByText("Patrick Gielen")));

        const dialog = screen.getByRole("dialog");
        await clickByName("Submit");
        await waitFor(() => expect(dialog).not.toBeInTheDocument());
    })

    async function openDialog() {
        render(<LocCreation locType="Transaction" requestButtonLabel={ requestButtonLabel } />);
        await clickByName(requestButtonLabel);
    }
})

