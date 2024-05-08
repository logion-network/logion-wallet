import { LegalOfficer, PostalAddress, UserIdentity } from '@logion/client';
import { LegalOfficerClass } from "@logion/client/dist/Types.js";
import { Transaction } from '@logion/client';
import { TypesAccountData, Numbers, Lgnt } from '@logion/node-api';

import { ColorTheme, rgbaToHex } from './ColorTheme';

import { DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER, A_THIRD_LEGAL_OFFICER } from "../__mocks__/LogionMock";
import { TEST_WALLET_USER, TEST_WALLET_USER2 } from 'src/wallet-user/TestData';
export { DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER, A_THIRD_LEGAL_OFFICER };

export const DEFAULT_IDENTITY: UserIdentity = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@logion.network",
    phoneNumber: "+1234",
};

export const DEFAULT_ADDRESS: PostalAddress = {
    line1: "Place de le République Française, 10",
    line2: "boite 15",
    postalCode: "4000",
    city: "Liège",
    country: "Belgium",
};

export const COLOR_THEME: ColorTheme = {
    type: 'light',
    shadowColor: rgbaToHex('#3b6cf4', 0.1),
    dashboard: {
        background: '#eff3fe',
        foreground: '#000000',
    },
    sidebar: {
        background: '#ffffff',
        foreground: '#000000',
        activeItemBackground: '#d8e2fd',
    },
    accounts: {
        iconBackground: '#3b6cf4',
        foreground: '#000000',
        background: 'eff3fe',
        legalOfficerIcon: {
            category: 'legal-officer',
            id: 'account-shield'
        }
    },
    frame: {
        background: '#ffffff',
        foreground: '#000000',
        link: rgbaToHex('#3b6cf4', 0.15),
        altBackground: '#eff3fe',
    },
    topMenuItems: {
        iconGradient: {
            from: '#3b6cf4',
            to: '#6050dc',
        }
    },
    bottomMenuItems: {
        iconGradient: {
            from: '#7a90cb',
            to: '#3b6cf4',
        }
    },
    recoveryItems: {
        iconGradient: {
            from: '#7a90cb',
            to: '#3b6cf4',
        }
    },
    buttons: {
        secondary: {
            background: '#eff3fe',
            foreground: '#000000',
        }
    },
    select: {
        background: '#ffffff',
        foreground: '#000000',
        menuBackgroundColor: '#ffffff',
        selectedOptionBackgroundColor: '#ffffff',
    },
    table: {
        background: '#0c163d',
        foreground: '#ffffff',
        header: {
            background: '#0c163d',
            foreground: '#ffffff',
        },
        row: {
            background: '#152665',
            foreground: '#ffffff',
        }
    },
    tabs: {
        background: '#0c163d',
        foreground: '#ffffff',
        inactiveTab: {
            background: '#d8e2fd',
            foreground: '#ffffff',
        },
        borderColor: '#3b6cf4',
    },
    dialog: {
        background: '#eff3fe',
        foreground: '#000000',
        borderColor: '#e6007a',
    },
    dialogTable: {
        background: '#0c163d',
        foreground: '#ffffff',
        header: {
            background: '#0c163d',
            foreground: '#ffffff',
        },
        row: {
            background: '#152665',
            foreground: '#ffffff',
        }
    },
};

export const DEFAULT_COIN_BALANCE: TypesAccountData = {
    total: Lgnt.fromCanonical(42n),
    available: Lgnt.fromCanonical(42n),
    reserved: Lgnt.zero(),
};

export const ZERO_BALANCE: TypesAccountData = {
    total: Lgnt.zero(),
    available: Lgnt.zero(),
    reserved: Lgnt.zero(),
};

export const DEFAULT_TRANSACTION: Transaction = {
    id: "id",
    from: TEST_WALLET_USER,
    to: TEST_WALLET_USER2,
    pallet: "pallet",
    method: "method",
    transferValue: "420",
    tip: "0",
    fees: {
        inclusion: "125000",
        total: "125000",
    },
    reserved: "0",
    total: "125420",
    createdOn: "2021-07-28T12:30:00.000",
    type: "EXTRINSIC",
    transferDirection: "Sent",
    successful: true
}

export const DEFAULT_FAILED_TRANSACTION:Transaction = {
    ...DEFAULT_TRANSACTION,
    successful: false,
    error: {
        section: 'aSection',
        name: 'aName',
        details: 'someDetails'
    }
}

export const PATRICK: LegalOfficer = {
    name: "Patrick Gielen",
    account: DEFAULT_LEGAL_OFFICER,
    additionalDetails: "",
    userIdentity: {
        firstName: "Patrick",
        lastName: "Gielen",
        email: "patrick@logion.network",
        phoneNumber: "+32 498 237 107",
    },
    postalAddress: {
        company: "MODERO",
        line1: "Huissier de Justice Etterbeek",
        line2: "Rue Beckers 17",
        postalCode: "1040",
        city: "Etterbeek",
        country: "Belgique"
    },
    node: "http://logion.patrick.com",
    nodeId: "",
    region: "Europe",
};

export const GUILLAUME: LegalOfficer = {
    name: "Guillaume Grain",
    account: ANOTHER_LEGAL_OFFICER,
    additionalDetails: "",
    userIdentity: {
        firstName: "Patrick",
        lastName: "Gielen",
        email: "g.grain@adrastee-lyon.fr",
        phoneNumber: "+33 4 78 52 87 56",
    },
    postalAddress: {
        company: "SELARL ADRASTEE",
        line1: "Gare des Brotteaux",
        line2: "14, place Jules Ferry",
        postalCode: "69006",
        city: "LYON",
        country: "France"
    },
    node: "http://logion.guillaume.com",
    nodeId: "",
    region: "Europe",
};

export const ALAIN: LegalOfficer = {
    name: "Alain Barland",
    account: A_THIRD_LEGAL_OFFICER,
    additionalDetails: "",
    userIdentity: {
        firstName: "Patrick",
        lastName: "Gielen",
        email: "alain.barland@auxilia-conseils.com",
        phoneNumber: "+33 2 48 67 50 50",
    },
    postalAddress: {
        company: "AUXILIA CONSEILS 18",
        line1: "Huissiers de Justice associés",
        line2: "7 rue Jean Francois Champollion Parc Comitec",
        postalCode: "18000",
        city: "Bourges",
        country: "France"
    },
    node: "http://logion.alain.com",
    nodeId: "",
    region: "Europe",
};

export const legalOfficers: LegalOfficer[] = [
    PATRICK,
    GUILLAUME,
    ALAIN
];

class TestLegalOfficer extends LegalOfficerClass {

    constructor(args: {
        legalOfficer: LegalOfficer,
        workload: number,
    }) {
        super({ legalOfficer: args.legalOfficer, axiosFactory: { buildAxiosInstance: jest.fn() } });
        this.workload = args.workload;
    }

    private readonly workload: number;

    getWorkload(): Promise<number> {
        return Promise.resolve(this.workload)
    }
}

export const oneLegalOfficer: LegalOfficerClass[] = [
    new TestLegalOfficer({ legalOfficer: PATRICK, workload: 1 }),
];

export const twoLegalOfficers: LegalOfficerClass[] = [
    oneLegalOfficer[0],
    new TestLegalOfficer({ legalOfficer: GUILLAUME, workload: 3 }),
];

export const threeLegalOfficers: LegalOfficerClass[] = [
    ...twoLegalOfficers,
    new TestLegalOfficer({ legalOfficer: ALAIN, workload: 2 }),
];
