jest.mock('../../common/CommonContext');
jest.mock('../../common/Model');
jest.mock('../../wallet-user/UserContext');

import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import RequestedLocs from './RequestedLocs';
import { axiosMock } from '../../common/__mocks__/CommonContextMock';
import { createLocRequest } from '../../common/Model';
import { DEFAULT_LEGAL_OFFICER } from '../../common/types/LegalOfficer';
import { TEST_WALLET_USER } from '../TestData';
import { setRecoveryConfig } from '../../wallet-user/__mocks__/UserContextMock';

import LocCreation from './LocCreation';

it("should display messages when an empty form is submitted", async () => {
    render(<LocCreation/>);
    openDialog();

    const button = screen.getByRole('button', {name: "Submit"});
    fireEvent.click(button)

    await waitFor(() => expect(screen.getByText("The description is required")).toBeInTheDocument());
});

function openDialog() {
    const button = screen.getByRole('button', {name: "Request a Transaction Protection"});
    fireEvent.click(button);
}

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
});

async function itCreatesLoc(fillIdentityInfo: boolean) {
    render(<LocCreation/>);
    openDialog();

    const description = "description";
    const descriptionInput = screen.getByRole("textbox", {name: "Description"});
    userEvent.type(descriptionInput, description);

    userEvent.click(screen.getByText("Select..."));
    await waitFor(() => userEvent.click(screen.getByText("Patrick Gielen")));

    if(fillIdentityInfo) {
        userEvent.type(screen.getByRole("textbox", {name: "First Name"}), "John");
        userEvent.type(screen.getByRole("textbox", {name: "Last Name"}), "Doe");
        userEvent.type(screen.getByRole("textbox", {name: "E-mail"}), "john@doe.com");
        userEvent.type(screen.getByRole("textbox", {name: "Phone"}), "+123456");
    }

    const button = screen.getByRole('button', {name: "Submit"});
    userEvent.click(button);

    await waitFor(() => expect(createLocRequest).toBeCalledWith(
        axiosMock.object(),
        expect.objectContaining({
            ownerAddress: DEFAULT_LEGAL_OFFICER,
            requesterAddress: TEST_WALLET_USER,
            description,
        })
    ));
}

it("should close dialog and not create token when cancel is pressed", async () => {
    render(<LocCreation/>);
    openDialog();

    const dialog = screen.getByRole("dialog");
    const button = screen.getByRole('button', {name: "Cancel"});
    fireEvent.click(button)
    expect(createLocRequest).not.toBeCalled();
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
});

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
});
