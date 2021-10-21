import moment from 'moment';

import { ProtectionRequest, ProtectionRequestStatus } from '../../common/types/ModelTypes';
import { DEFAULT_IDENTITY, DEFAULT_ADDRESS } from '../../common/TestData';
import { TEST_WALLET_USER } from '../TestData';

export const ACTIVATED_PROTECTION_REQUEST: ProtectionRequest = createProtectionRequest("ACTIVATED", false, null);

export const PENDING_PROTECTION_REQUEST: ProtectionRequest = createProtectionRequest("PENDING", false, null);

export const PROTECTION_REQUEST: ProtectionRequest = ACTIVATED_PROTECTION_REQUEST;

export const ACTIVATED_RECOVERY_REQUEST: ProtectionRequest = createProtectionRequest("ACTIVATED", true, "toRecover");

export const PENDING_RECOVERY_REQUEST: ProtectionRequest = createProtectionRequest("PENDING", true, "toRecover");

export const RECOVERY_REQUEST: ProtectionRequest = ACTIVATED_RECOVERY_REQUEST;

function createProtectionRequest(status: ProtectionRequestStatus, isRecovery:boolean, addressToRecover:string | null): ProtectionRequest {
    return {
        id: '2eb5f71c-7f31-44b5-9390-c3bf56501880',
        requesterAddress: TEST_WALLET_USER,
        decisions: [
            {
                legalOfficerAddress: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
                status: 'PENDING',
                rejectReason: null,
                decisionOn: null,
                requestId: '2eb5f71c-7f31-44b5-9390-c3bf56501880'
            },
            {
                legalOfficerAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
                status: 'PENDING',
                rejectReason: null,
                decisionOn: null,
                requestId: '2eb5f71c-7f31-44b5-9390-c3bf56501880'
            }
        ],
        userIdentity: DEFAULT_IDENTITY,
        userPostalAddress: DEFAULT_ADDRESS,
        createdOn: moment('2021-06-10T13:48:00.000Z').toISOString(),
        isRecovery,
        addressToRecover,
        status,
    };
}
