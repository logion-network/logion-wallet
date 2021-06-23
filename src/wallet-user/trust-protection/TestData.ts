import moment from 'moment';

import { ProtectionRequest } from '../../legal-officer/Types';
import { DEFAULT_IDENTITY, DEFAULT_ADDRESS } from '../../component/TestData';
import { TEST_WALLET_USER } from '../TestData';

export const PROTECTION_REQUEST: ProtectionRequest = {
    id: '2eb5f71c-7f31-44b5-9390-c3bf56501880',
    requesterAddress: TEST_WALLET_USER,
    decisions: [
        {
            legalOfficerAddress: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
            status: 'PENDING',
            rejectReason: null,
            decisionOn: null
        },
        {
            legalOfficerAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            status: 'PENDING',
            rejectReason: null,
            decisionOn: null
        }
    ],
    userIdentity: DEFAULT_IDENTITY,
    userPostalAddress: DEFAULT_ADDRESS,
    createdOn: moment('2021-06-10T13:48:00.000Z').toISOString(),
    isRecovery: false,
    addressToRecover: null,
};


export const RECOVERY_REQUEST: ProtectionRequest = {
    id: '2eb5f71c-7f31-44b5-9390-c3bf56501880',
    requesterAddress: TEST_WALLET_USER,
    decisions: [
        {
            legalOfficerAddress: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
            status: 'PENDING',
            rejectReason: null,
            decisionOn: null
        },
        {
            legalOfficerAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            status: 'PENDING',
            rejectReason: null,
            decisionOn: null
        }
    ],
    userIdentity: DEFAULT_IDENTITY,
    userPostalAddress: DEFAULT_ADDRESS,
    createdOn: moment('2021-06-10T13:48:00.000Z').toISOString(),
    isRecovery: true,
    addressToRecover: "toRecover",
};
