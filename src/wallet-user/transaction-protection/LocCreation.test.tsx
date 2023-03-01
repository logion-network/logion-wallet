import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { clickByName, typeByLabel } from '../../tests';
import LocCreation from './LocCreation';
import { setHasValidIdentityLoc, setLocsState, setMutateLocsState } from "../__mocks__/UserContextMock";
import { PATRICK, GUILLAUME } from "../../common/TestData";
import { DraftRequest, LocsState } from '@logion/client';
import { UUID } from '@logion/node-api';
import { navigate } from 'src/__mocks__/ReactRouterMock';

jest.mock('../../common/CommonContext');
jest.mock('../../common/Model');
jest.mock('../../wallet-user/UserContext');
jest.mock('../../logion-chain');
jest.unmock("@logion/client");

const requestButtonLabel = "Request a Transaction Protection"

describe("LocCreation", () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("should disable 'Submit' when user has valid id LOC but the form is empty", async () => {
        setHasValidIdentityLoc([ PATRICK ])
        await openDialog(true);

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
            expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
            expect(screen.getByRole("button", { name: "Request an Identity Case" })).toBeEnabled();
        });
    })

    it("should enable 'Submit' and remove 'Request an Identity Case' when an LO is selected", async () => {
        setHasValidIdentityLoc([ GUILLAUME ])
        await openDialog(true);

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
        await openDialog(false);

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
            expect(screen.queryByRole("button", { name: "Submit" })).toBeNull();
            expect(screen.getByRole("button", { name: "Request an Identity Case" })).toBeEnabled();
        });
    })

    it("should close dialog and not create a request when cancel is pressed", async () => {
        setHasValidIdentityLoc([ PATRICK ])
        await openDialog(true);

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
            legalOfficersWithValidIdentityLoc: [ PATRICK, GUILLAUME ],
            requestLoc: () => Promise.resolve(draftRequest),
        } as unknown as LocsState;
        setLocsState(locsState);
        setMutateLocsState(async (mutator: (current: LocsState) => Promise<LocsState>): Promise<void> => {
            await mutator(locsState);
            return Promise.resolve();
        });

        await openDialog(true);

        const description = "description";
        await typeByLabel("Description", description)

        await userEvent.click(screen.getByText("Select..."));
        await waitFor(() => userEvent.click(screen.getByText("Patrick Gielen")));
        await clickByName("Submit");

        await waitFor(() => expect(navigate).toBeCalledWith(`/user/loc/transaction/${locId.toString()}`));
    })

    async function openDialog(selectProject: boolean) {
        render(<LocCreation locType="Transaction" requestButtonLabel={ requestButtonLabel } />);
        await clickByName(requestButtonLabel);
        if(selectProject) {
            await selectProjectType();
        }
    }

    async function selectProjectType() {
        await userEvent.click(screen.getByText("Please select your project type"));
        await userEvent.click(screen.getByText("Specific"));
        await clickByName("Submit");
    }    
})
