import { ProtectionRequest, ProtectionRequestStatus } from '@logion/client/dist/RecoveryClient';
import moment from 'moment';

import { DEFAULT_IDENTITY, DEFAULT_ADDRESS, DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER } from '../../common/TestData';
import { TEST_WALLET_USER } from '../TestData';

export const ACTIVATED_PROTECTION_REQUEST1: ProtectionRequest = createProtectionRequest("request1", DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER, "ACTIVATED", false, null);

export const ACTIVATED_PROTECTION_REQUEST2: ProtectionRequest = createProtectionRequest("request2", ANOTHER_LEGAL_OFFICER, DEFAULT_LEGAL_OFFICER, "ACTIVATED", false, null);

export const ACTIVATED_PROTECTION_REQUESTS = [ ACTIVATED_PROTECTION_REQUEST1, ACTIVATED_PROTECTION_REQUEST2 ];

export const ACTIVATED_PROTECTION_REQUEST3: ProtectionRequest = createProtectionRequest("request3", DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER, "ACTIVATED", false, null);

export const ACCEPTED_PROTECTION_REQUEST1: ProtectionRequest = createProtectionRequest("request1", DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER, "ACCEPTED", false, null);

export const ACCEPTED_PROTECTION_REQUEST2: ProtectionRequest = createProtectionRequest("request2", ANOTHER_LEGAL_OFFICER, DEFAULT_LEGAL_OFFICER, "ACCEPTED", false, null);

export const ACCEPTED_PROTECTION_REQUESTS = [ ACCEPTED_PROTECTION_REQUEST1, ACCEPTED_PROTECTION_REQUEST2 ];

export const PENDING_PROTECTION_REQUEST1: ProtectionRequest = createProtectionRequest("request1", DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER, "PENDING", false, null);

export const PENDING_PROTECTION_REQUEST2: ProtectionRequest = createProtectionRequest("request2", ANOTHER_LEGAL_OFFICER, DEFAULT_LEGAL_OFFICER, "PENDING", false, null);

export const PENDING_PROTECTION_REQUESTS = [ PENDING_PROTECTION_REQUEST1, PENDING_PROTECTION_REQUEST2 ];

export const PROTECTION_REQUEST: ProtectionRequest = ACTIVATED_PROTECTION_REQUEST1;

export const ACTIVATED_RECOVERY_REQUEST1: ProtectionRequest = createProtectionRequest("request1", DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER, "ACTIVATED", true, "toRecover");

export const ACTIVATED_RECOVERY_REQUEST2: ProtectionRequest = createProtectionRequest("request2", ANOTHER_LEGAL_OFFICER, DEFAULT_LEGAL_OFFICER, "ACTIVATED", true, "toRecover");

export const ACTIVATED_RECOVERY_REQUESTS = [ ACTIVATED_RECOVERY_REQUEST1, ACTIVATED_RECOVERY_REQUEST2 ];

export const PENDING_RECOVERY_REQUEST1: ProtectionRequest = createProtectionRequest("request1", DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER, "PENDING", true, "toRecover");

export const PENDING_RECOVERY_REQUEST2: ProtectionRequest = createProtectionRequest("request2", ANOTHER_LEGAL_OFFICER, DEFAULT_LEGAL_OFFICER, "PENDING", true, "toRecover");

export const PENDING_RECOVERY_REQUESTS = [ PENDING_RECOVERY_REQUEST1, PENDING_RECOVERY_REQUEST2 ];

export const RECOVERY_REQUEST: ProtectionRequest = ACTIVATED_RECOVERY_REQUEST1;

export const ACCEPTED_RECOVERY_REQUEST1: ProtectionRequest = createProtectionRequest("request1", DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER, "ACCEPTED", true, "toRecover");

export const ACCEPTED_RECOVERY_REQUEST2: ProtectionRequest = createProtectionRequest("request2", ANOTHER_LEGAL_OFFICER, DEFAULT_LEGAL_OFFICER, "ACCEPTED", true, "toRecover");

export const ACCEPTED_RECOVERY_REQUESTS = [ ACCEPTED_RECOVERY_REQUEST1, ACCEPTED_RECOVERY_REQUEST2 ];

function createProtectionRequest(
    requestId: string,
    legalOfficerAddress: string,
    otherLegalOfficerAddress: string,
    status: ProtectionRequestStatus,
    isRecovery:boolean,
    addressToRecover:string | null
): ProtectionRequest {
    return {
        id: requestId,
        requesterAddress: TEST_WALLET_USER,
        legalOfficerAddress,
        otherLegalOfficerAddress,
        decision: {
            rejectReason: status === 'REJECTED' ? "Because" : null,
            decisionOn: status !== 'PENDING' ? moment('2021-06-10T13:48:00.000Z').toISOString() : null,
        },
        userIdentity: DEFAULT_IDENTITY,
        userPostalAddress: DEFAULT_ADDRESS,
        createdOn: moment('2021-06-10T13:48:00.000Z').toISOString(),
        isRecovery,
        addressToRecover,
        status,
    };
}
