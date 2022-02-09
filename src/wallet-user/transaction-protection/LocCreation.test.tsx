import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { clickByName, typeByLabel } from '../../tests';
import { DEFAULT_LEGAL_OFFICER } from "../../common/TestData";
import { setRecoveryConfig } from '../__mocks__/UserContextMock';

import LocCreation from './LocCreation';

jest.mock('../../common/CommonContext');
jest.mock('../../common/Model');
jest.mock('../../wallet-user/UserContext');

describe("LocCreation", () => {

    it("should display messages when an empty form is submitted", async () => {
        render(<LocCreation locType="Transaction" />);

        await clickByName("Request a Transaction Protection");
        await clickByName("Submit");

        await waitFor(() => expect(screen.getByText("The description is required")).toBeInTheDocument());
    })

    it("should create a LOC and display no message when a valid form is submitted", async () => {
        setRecoveryConfig({
            isNone: false,
            unwrap: () => ({
                friends: {
                    toArray: () => [
                        { toString: () => DEFAULT_LEGAL_OFFICER }
                    ]
                }
            })
        });
        await itCreatesLoc(false);
    })

    it("should close dialog and not create token when cancel is pressed", async () => {
        render(<LocCreation locType="Transaction" />);

        await clickByName("Request a Transaction Protection");
        const dialog = screen.getByRole("dialog");
        await clickByName("Cancel");
        await waitFor(() => expect(dialog).not.toBeInTheDocument());
    })

    it("should create a LOC with identity info if not protected by selected LO", async () => {
        setRecoveryConfig({
            isNone: false,
            unwrap: () => ({
                friends: {
                    toArray: () => [
                        { toString: () => "" }
                    ]
                }
            })
        });
        await itCreatesLoc(true);
    })
})

async function itCreatesLoc(fillIdentityInfo: boolean) {
    render(<LocCreation locType="Transaction" />);

    await clickByName("Request a Transaction Protection");

    const description = "description";
    await typeByLabel("Description", description)

    userEvent.click(screen.getByText("Select..."));
    await waitFor(() => userEvent.click(screen.getByText("Patrick Gielen")));

    if(fillIdentityInfo) {
        await typeByLabel("First Name", "John");
        await typeByLabel("Last Name", "Doe");
        await typeByLabel("E-mail", "john@doe.com");
        await typeByLabel("Phone", "+123456");
    }

    const dialog = screen.getByRole("dialog");
    await clickByName("Submit");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
}
