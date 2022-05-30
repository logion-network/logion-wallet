import moment from 'moment';
import { toIsoString } from '@logion/node-api/dist/datetime';
import { ProtectionRequest } from '@logion/client/dist/RecoveryClient';

import { DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER } from "../common/TestData";

export const PENDING_PROTECTION_REQUESTS: ProtectionRequest[] = [
    {
        id: "1",
        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
        otherLegalOfficerAddress: ANOTHER_LEGAL_OFFICER,
        decision: {
            rejectReason: null,
            decisionOn: null,
        },
        userIdentity: {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@logion.network",
            phoneNumber: "+1234",
        },
        userPostalAddress: {
            line1: "Place de le République Française, 10",
            line2: "boite 15",
            postalCode: "4000",
            city: "Liège",
            country: "Belgium",
        },
        createdOn: toIsoString(moment('2021-06-10T11:40:00.000Z')),
        isRecovery: false,
        addressToRecover: null,
        status: "PENDING"
    }
];

export const PROTECTION_REQUESTS_HISTORY: ProtectionRequest[] = [
    {
        id: "1",
        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
        otherLegalOfficerAddress: ANOTHER_LEGAL_OFFICER,
        decision: {
                rejectReason: null,
                decisionOn: toIsoString(moment('2021-06-10T11:40:00.000Z')),
                locId: "locId"
        },
        userIdentity: {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@logion.network",
            phoneNumber: "+1234",
        },
        userPostalAddress: {
            line1: "Place de le République Française, 10",
            line2: "boite 15",
            postalCode: "4000",
            city: "Liège",
            country: "Belgium",
        },
        createdOn: toIsoString(moment('2021-06-10T11:40:00.000Z')),
        isRecovery: false,
        addressToRecover: null,
        status: "ACTIVATED"
    }
];

export const RECOVERY_REQUESTS_HISTORY: ProtectionRequest[] = [
    {
        id: "1",
        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
        otherLegalOfficerAddress: ANOTHER_LEGAL_OFFICER,
        decision: {
            rejectReason: null,
            decisionOn: toIsoString(moment('2021-06-10T11:40:00.000Z')),
            locId: "locId"
        },
        userIdentity: {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@logion.network",
            phoneNumber: "+1234",
        },
        userPostalAddress: {
            line1: "Place de le République Française, 10",
            line2: "boite 15",
            postalCode: "4000",
            city: "Liège",
            country: "Belgium",
        },
        createdOn: toIsoString(moment('2021-06-10T11:40:00.000Z')),
        isRecovery: true,
        addressToRecover: "an-address",
        status: "PENDING"
    }
];
