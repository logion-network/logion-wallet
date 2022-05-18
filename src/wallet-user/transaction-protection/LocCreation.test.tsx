import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { clickByName, typeByLabel } from '../../tests';
import { GUILLAUME, PATRICK } from "../../common/TestData";
import { setProtectionState } from '../__mocks__/UserContextMock';

import LocCreation from './LocCreation';
import { ActiveProtection, NoProtection } from '@logion/client';
import { RecoverySharedState } from '@logion/client/dist/Recovery';
import { ACTIVATED_PROTECTION_REQUESTS } from '../trust-protection/TestData';

jest.mock('../../common/CommonContext');
jest.mock('../../common/Model');
jest.mock('../../wallet-user/UserContext');
jest.mock('../../logion-chain');
jest.unmock("@logion/client");

describe("LocCreation", () => {

    it("should display messages when an empty form is submitted", async () => {
        setProtectionState(new ActiveProtection({
            pendingProtectionRequests: [],
            acceptedProtectionRequests: ACTIVATED_PROTECTION_REQUESTS,
            allRequests: ACTIVATED_PROTECTION_REQUESTS,
            selectedLegalOfficers: [ PATRICK, GUILLAUME ],
            recoveryConfig: {
                legalOfficers: [ PATRICK.address, GUILLAUME.address ]
            },
        } as unknown as RecoverySharedState));
        render(<LocCreation locType="Transaction" requestButtonLabel="Request a Transaction Protection" />);

        await clickByName("Request a Transaction Protection");
        await clickByName("Submit");

        await waitFor(() => expect(screen.getByText("The description is required")).toBeInTheDocument());
    })

    it("should create a LOC and display no message when a valid form is submitted", async () => {
        setProtectionState(new ActiveProtection({
            pendingProtectionRequests: [],
            acceptedProtectionRequests: ACTIVATED_PROTECTION_REQUESTS,
            allRequests: ACTIVATED_PROTECTION_REQUESTS,
            selectedLegalOfficers: [ PATRICK, GUILLAUME ],
            recoveryConfig: {
                legalOfficers: [ PATRICK.address, GUILLAUME.address ]
            }
        } as unknown as RecoverySharedState));
        await itCreatesLoc(false);
    })

    it("should close dialog and not create token when cancel is pressed", async () => {
        setProtectionState(new ActiveProtection({
            pendingProtectionRequests: [],
            acceptedProtectionRequests: ACTIVATED_PROTECTION_REQUESTS,
            allRequests: ACTIVATED_PROTECTION_REQUESTS,
            selectedLegalOfficers: [ PATRICK, GUILLAUME ],
            recoveryConfig: {
                legalOfficers: [ PATRICK.address, GUILLAUME.address ]
            }
        } as unknown as RecoverySharedState));
        render(<LocCreation locType="Transaction" requestButtonLabel="Request a Transaction Protection" />);

        await clickByName("Request a Transaction Protection");
        const dialog = screen.getByRole("dialog");
        await clickByName("Cancel");
        await waitFor(() => expect(dialog).not.toBeInTheDocument());
    })

    it("should create a LOC with identity info if not protected by selected LO", async () => {
        setProtectionState(new NoProtection({
            
        } as unknown as RecoverySharedState));
        await itCreatesLoc(true);
    })
})

async function itCreatesLoc(fillIdentityInfo: boolean) {
    render(<LocCreation locType="Transaction" requestButtonLabel="Request a Transaction Protection"/>);

    await clickByName("Request a Transaction Protection");

    const description = "description";
    await typeByLabel("Description", description)

    await userEvent.click(screen.getByText("Select..."));
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
