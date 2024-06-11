import { DEFAULT_IDENTITY, DEFAULT_ADDRESS, DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER } from '../../common/TestData';
import { TEST_WALLET_USER } from '../TestData';
import { AccountRecoveryRequest, ProtectionRequestStatus } from '@logion/client/dist/AccountRecoveryClient';

export const IDENTITY_LOC_ID = "86f8884c-79fa-4d80-ba79-b7e3aa4728a7";

export const ACTIVATED_RECOVERY_REQUEST1: AccountRecoveryRequest = createProtectionRequest("request1", DEFAULT_LEGAL_OFFICER.address, ANOTHER_LEGAL_OFFICER.address, "ACTIVATED", TEST_WALLET_USER.address, IDENTITY_LOC_ID);

export const ACTIVATED_RECOVERY_REQUEST2: AccountRecoveryRequest = createProtectionRequest("request2", ANOTHER_LEGAL_OFFICER.address, DEFAULT_LEGAL_OFFICER.address, "ACTIVATED", TEST_WALLET_USER.address, IDENTITY_LOC_ID);

export const ACTIVATED_RECOVERY_REQUESTS = [ ACTIVATED_RECOVERY_REQUEST1, ACTIVATED_RECOVERY_REQUEST2 ];

export const PENDING_RECOVERY_REQUEST1: AccountRecoveryRequest = createProtectionRequest("request1", DEFAULT_LEGAL_OFFICER.address, ANOTHER_LEGAL_OFFICER.address, "PENDING", TEST_WALLET_USER.address, IDENTITY_LOC_ID);

export const PENDING_RECOVERY_REQUEST2: AccountRecoveryRequest = createProtectionRequest("request2", ANOTHER_LEGAL_OFFICER.address, DEFAULT_LEGAL_OFFICER.address, "PENDING", TEST_WALLET_USER.address, IDENTITY_LOC_ID);

export const PENDING_RECOVERY_REQUESTS = [ PENDING_RECOVERY_REQUEST1, PENDING_RECOVERY_REQUEST2 ];

export const RECOVERY_REQUEST: AccountRecoveryRequest = ACTIVATED_RECOVERY_REQUEST1;

export const ACCEPTED_RECOVERY_REQUEST1: AccountRecoveryRequest = createProtectionRequest("request1", DEFAULT_LEGAL_OFFICER.address, ANOTHER_LEGAL_OFFICER.address, "ACCEPTED", TEST_WALLET_USER.address, IDENTITY_LOC_ID);

export const ACCEPTED_RECOVERY_REQUEST2: AccountRecoveryRequest = createProtectionRequest("request2", ANOTHER_LEGAL_OFFICER.address, DEFAULT_LEGAL_OFFICER.address, "ACCEPTED", TEST_WALLET_USER.address, IDENTITY_LOC_ID);

export const ACCEPTED_RECOVERY_REQUESTS = [ ACCEPTED_RECOVERY_REQUEST1, ACCEPTED_RECOVERY_REQUEST2 ];

function createProtectionRequest(
    requestId: string,
    legalOfficerAddress: string,
    otherLegalOfficerAddress: string,
    status: ProtectionRequestStatus,
    addressToRecover: string,
    requesterIdentityLoc: string,
): AccountRecoveryRequest {
    return {
        id: requestId,
        requesterAddress: TEST_WALLET_USER.address,
        legalOfficerAddress,
        otherLegalOfficerAddress,
        decision: {
            rejectReason: status === 'REJECTED' ? "Because" : null,
            decisionOn: status !== 'PENDING' ? '2021-06-10T13:48:00.000Z' : null,
        },
        userIdentity: DEFAULT_IDENTITY,
        userPostalAddress: DEFAULT_ADDRESS,
        createdOn: '2021-06-10T13:48:00.000Z',
        addressToRecover,
        status,
        requesterIdentityLoc,
    };
}
