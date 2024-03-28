import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { clickByName, typeByLabel } from '../tests';
import TransactionLocCreation from './TransactionLocCreation';
import { setHasValidIdentityLoc, setLocsState, setMutateLocsState } from "../wallet-user/__mocks__/UserContextMock";
import { oneLegalOfficer, twoLegalOfficers } from "../common/TestData";
import { DraftRequest, LocsState } from '@logion/client';
import { UUID } from '@logion/node-api';
import { navigate } from '../__mocks__/ReactRouterMock';

jest.mock('../common/CommonContext');
jest.mock('../common/Model');
jest.mock('../wallet-user/UserContext');
jest.mock('../logion-chain');
jest.unmock("@logion/client");

const requestButtonLabel = "Request a Transaction Protection"

describe("LocCreation", () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("should disable 'Submit' when user has valid id LOC but the form is empty", async () => {
        setHasValidIdentityLoc(oneLegalOfficer)
        await openDialog();

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
            expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
            expect(screen.getByRole("button", { name: "Request an Identity Protection" })).toBeEnabled();
        });
    })

    it("should enable 'Submit' and remove 'Request an Identity Protection' when an LO is selected", async () => {
        setHasValidIdentityLoc([ twoLegalOfficers[1] ])
        await openDialog();

        await userEvent.click(screen.getByText("Select..."));
        await waitFor(() => userEvent.click(screen.getByText("Guillaume Grain (workload: 3)")));

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
            expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
            expect(screen.queryByRole("button", { name: "Request an Identity Protection" })).toBeNull();
        });
    })

    it("should remove 'Submit' and enable 'Request an Identity Protection' when there are no LO's", async () => {
        setHasValidIdentityLoc([ ])
        await openDialog();

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
            expect(screen.queryByRole("button", { name: "Submit" })).toBeNull();
            expect(screen.getByRole("button", { name: "Request an Identity Protection" })).toBeEnabled();
        });
    })

    it("should close dialog and not create a request when cancel is pressed", async () => {
        setHasValidIdentityLoc(oneLegalOfficer)
        await openDialog();

        const dialog = screen.getByRole("dialog");
        await clickByName("Cancel");
        await waitFor(() => expect(dialog).not.toBeInTheDocument());
    })

    it("should create the request if the selected LO has a valid identity LOC", async () => {
        const locId = new UUID("a2b9dfa7-cbde-414b-8cda-cdd221a57643");
        const draftRequest = {
            locId,
            locsState: () => locsState,
        } as DraftRequest;
        const locsState = {
            legalOfficersWithValidIdentityLoc: twoLegalOfficers,
            requestTransactionLoc: () => Promise.resolve(draftRequest),
        } as unknown as LocsState;
        setLocsState(locsState);
        setMutateLocsState(async (mutator: (current: LocsState) => Promise<LocsState>): Promise<void> => {
            await mutator(locsState);
            return Promise.resolve();
        });

        await openDialog();

        const description = "description";
        await typeByLabel("Description", description)

        await userEvent.click(screen.getByText("Select..."));
        await waitFor(() => userEvent.click(screen.getByText("Patrick Gielen (workload: 1)")));
        await clickByName("Submit");

        await waitFor(() => expect(navigate).toBeCalledWith(`/user/loc/transaction/${locId.toString()}`));
    })

    async function openDialog() {
        render(<TransactionLocCreation requestButtonLabel={ requestButtonLabel } />);
        await clickByName(requestButtonLabel);
    }
})
