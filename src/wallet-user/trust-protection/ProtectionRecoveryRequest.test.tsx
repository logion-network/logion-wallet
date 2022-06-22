jest.mock('../../logion-chain/Signature');
jest.mock('../../logion-chain');
jest.mock('../../common/CommonContext');
jest.mock('../UserContext');
jest.unmock('@logion/client');

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { shallowRender } from "../../tests";

import ProtectionRecoveryRequest from './ProtectionRecoveryRequest';
import {
    ACTIVATED_PROTECTION_REQUESTS,
    PENDING_PROTECTION_REQUESTS,
    ACTIVATED_RECOVERY_REQUESTS,
    PENDING_RECOVERY_REQUESTS,
    ACCEPTED_PROTECTION_REQUESTS,
    ACCEPTED_RECOVERY_REQUESTS,
} from './TestData';
import { DEFAULT_SHARED_STATE, setProtectionState, activateProtection } from '../__mocks__/UserContextMock';
import { AcceptedProtection, ActiveProtection, ClaimedRecovery, PendingProtection, PendingRecovery } from '@logion/client';
import { GUILLAUME, PATRICK } from 'src/common/TestData';

describe("ProtectionRecoveryRequest", () => {

    it("activated protection request", () => {
        const state = new ActiveProtection({
            ...DEFAULT_SHARED_STATE,
            acceptedProtectionRequests: ACTIVATED_PROTECTION_REQUESTS,
            pendingProtectionRequests: [],
            allRequests: ACTIVATED_PROTECTION_REQUESTS,
            rejectedProtectionRequests: [],
            cancelledProtectionRequests: [],
            selectedLegalOfficers: [ PATRICK, GUILLAUME ]
        });
        setProtectionState(state);
        const tree = shallowRender(<ProtectionRecoveryRequest type='activated'/>)
        expect(tree).toMatchSnapshot();
    });

    it("pending protection request", () => {
        const state = new PendingProtection({
            ...DEFAULT_SHARED_STATE,
            acceptedProtectionRequests: [],
            pendingProtectionRequests: PENDING_PROTECTION_REQUESTS,
            allRequests: PENDING_PROTECTION_REQUESTS,
            rejectedProtectionRequests: [],
            cancelledProtectionRequests: [],
            selectedLegalOfficers: [ PATRICK, GUILLAUME ]
        });
        setProtectionState(state);
        const tree = shallowRender(<ProtectionRecoveryRequest type='activated'/>)
        expect(tree).toMatchSnapshot();
    });

    it("activated recovery request", () => {
        const state = new ClaimedRecovery({
            ...DEFAULT_SHARED_STATE,
            acceptedProtectionRequests: ACTIVATED_RECOVERY_REQUESTS,
            pendingProtectionRequests: [],
            allRequests: ACTIVATED_RECOVERY_REQUESTS,
            rejectedProtectionRequests: [],
            cancelledProtectionRequests: [],
            selectedLegalOfficers: [ PATRICK, GUILLAUME ]
        });
        setProtectionState(state);
        const tree = shallowRender(<ProtectionRecoveryRequest type='activated'/>)
        expect(tree).toMatchSnapshot();
    });

    it("pending recovery request", () => {
        const state = new PendingRecovery({
            ...DEFAULT_SHARED_STATE,
            acceptedProtectionRequests: ACCEPTED_RECOVERY_REQUESTS,
            pendingProtectionRequests: [],
            allRequests: ACCEPTED_RECOVERY_REQUESTS,
            rejectedProtectionRequests: [],
            cancelledProtectionRequests: [],
            selectedLegalOfficers: [ PATRICK, GUILLAUME ]
        });
        setProtectionState(state);
        const tree = shallowRender(<ProtectionRecoveryRequest type='activated'/>)
        expect(tree).toMatchSnapshot();
    });

    it("Activation of accepted protection request", async () => {
        const state = new AcceptedProtection({
            ...DEFAULT_SHARED_STATE,
            acceptedProtectionRequests: ACCEPTED_PROTECTION_REQUESTS,
            pendingProtectionRequests: [],
            allRequests: ACCEPTED_PROTECTION_REQUESTS,
            rejectedProtectionRequests: [],
            cancelledProtectionRequests: [],
            selectedLegalOfficers: [ PATRICK, GUILLAUME ]
        });
        setProtectionState(state);
        render(<ProtectionRecoveryRequest type='accepted' />);

        const activateButton = screen.getByRole('button', {name: "Activate"});
        await userEvent.click(activateButton);

        await waitFor(() => expect(activateProtection).toBeCalled());
    });

    it("protection request", () => {
        const state = new PendingProtection({
            ...DEFAULT_SHARED_STATE,
            acceptedProtectionRequests: [],
            pendingProtectionRequests: PENDING_PROTECTION_REQUESTS,
            allRequests: PENDING_PROTECTION_REQUESTS,
            rejectedProtectionRequests: [],
            cancelledProtectionRequests: [],
            selectedLegalOfficers: [ PATRICK, GUILLAUME ]
        });
        setProtectionState(state);
        const tree = shallowRender(<ProtectionRecoveryRequest type='pending' />)
        expect(tree).toMatchSnapshot();
    });

    it("recovery request", () => {
        const state = new PendingProtection({
            ...DEFAULT_SHARED_STATE,
            acceptedProtectionRequests: [],
            pendingProtectionRequests: PENDING_RECOVERY_REQUESTS,
            allRequests: PENDING_RECOVERY_REQUESTS,
            rejectedProtectionRequests: [],
            cancelledProtectionRequests: [],
            selectedLegalOfficers: [ PATRICK, GUILLAUME ]
        });
        setProtectionState(state);
        const tree = shallowRender(<ProtectionRecoveryRequest type='pending' />)
        expect(tree).toMatchSnapshot();
    });
});
