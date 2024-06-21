import { DateTime } from 'luxon';
import { toIsoString, ProtectionRequest } from "@logion/client";

import { DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER } from "../common/TestData";

export const RECOVERY_REQUESTS_HISTORY: ProtectionRequest[] = [
    {
        id: "1",
        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER.address,
        otherLegalOfficerAddress: ANOTHER_LEGAL_OFFICER.address,
        requesterIdentityLoc: "460acfb9-0bae-42d2-9a23-0545d964e633",
        decision: {
            rejectReason: null,
            decisionOn: toIsoString(DateTime.fromISO('2021-06-10T11:40:00.000', {zone: "utc"})),
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
        createdOn: toIsoString(DateTime.fromISO('2021-06-10T11:40:00.000', {zone: "utc"})),
        addressToRecover: "5EsuBEtGbx8DoKTcKYDceJudEuzzHSS6GBPhbaPh4rsYsuoL",
        status: "PENDING"
    }
];
