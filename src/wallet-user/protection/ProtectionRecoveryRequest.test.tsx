jest.mock('../../logion-chain/Signature');
jest.mock('../../logion-chain');
jest.mock('../../common/CommonContext');
jest.mock('../UserContext');
jest.unmock('@logion/client');

import { shallowRender } from "../../tests";

import ProtectionRecoveryRequest from './ProtectionRecoveryRequest';
import {
    ACTIVATED_RECOVERY_REQUESTS,
    PENDING_RECOVERY_REQUESTS,
    ACCEPTED_RECOVERY_REQUESTS,
} from './TestData';
import { DEFAULT_SHARED_STATE, setProtectionState } from '../__mocks__/UserContextMock';
import { AcceptedRecovery, ActiveRecovery, PendingRecovery } from '@logion/client';
import { twoLegalOfficers } from 'src/common/TestData';

describe("ProtectionRecoveryRequest", () => {

    it("activated recovery request", () => {
        const state = new ActiveRecovery({
            ...DEFAULT_SHARED_STATE,
            acceptedProtectionRequests: ACTIVATED_RECOVERY_REQUESTS,
            pendingProtectionRequests: [],
            allRequests: ACTIVATED_RECOVERY_REQUESTS,
            rejectedProtectionRequests: [],
            cancelledProtectionRequests: [],
            selectedLegalOfficers: twoLegalOfficers
        });
        setProtectionState(state);
        const tree = shallowRender(<ProtectionRecoveryRequest type='activated'/>)
        expect(tree).toMatchSnapshot();
    });

    it("active recovery request", () => {
        const state = new PendingRecovery({
            ...DEFAULT_SHARED_STATE,
            acceptedProtectionRequests: ACCEPTED_RECOVERY_REQUESTS,
            pendingProtectionRequests: [],
            allRequests: ACCEPTED_RECOVERY_REQUESTS,
            rejectedProtectionRequests: [],
            cancelledProtectionRequests: [],
            selectedLegalOfficers: twoLegalOfficers
        });
        setProtectionState(state);
        const tree = shallowRender(<ProtectionRecoveryRequest type='activated'/>)
        expect(tree).toMatchSnapshot();
    });

    it("pending recovery request", () => {
        const state = new AcceptedRecovery({
            ...DEFAULT_SHARED_STATE,
            acceptedProtectionRequests: [],
            pendingProtectionRequests: PENDING_RECOVERY_REQUESTS,
            allRequests: PENDING_RECOVERY_REQUESTS,
            rejectedProtectionRequests: [],
            cancelledProtectionRequests: [],
            selectedLegalOfficers: twoLegalOfficers
        });
        setProtectionState(state);
        const tree = shallowRender(<ProtectionRecoveryRequest type='pending' />)
        expect(tree).toMatchSnapshot();
    });
});
