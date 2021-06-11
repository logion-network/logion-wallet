import moment from 'moment';
import { toIsoString } from '../logion-chain/datetime';
import { ProtectionRequest, DEFAULT_LEGAL_OFFICER } from './Types';

export const PENDING_PROTECTION_REQUESTS: ProtectionRequest[] = [
    {
        id: "1",
        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
        decisions: [
            {
                legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
                status: 'PENDING',
                rejectReason: null,
                decisionOn: null
            }
        ],
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
        createdOn: toIsoString(moment('2021-06-10T11:40:00.000Z'))
    }
];

export const PROTECTION_REQUESTS_HISTORY: ProtectionRequest[] = [
    {
        id: "1",
        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
        decisions: [
            {
                legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
                status: 'ACCEPTED',
                rejectReason: null,
                decisionOn: toIsoString(moment('2021-06-10T11:40:00.000Z'))
            }
        ],
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
        createdOn: toIsoString(moment('2021-06-10T11:40:00.000Z'))
    }
];
