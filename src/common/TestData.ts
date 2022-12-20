import { LegalOfficer, PostalAddress, UserIdentity } from '@logion/client';
import { Transaction } from '@logion/client/dist/TransactionClient.js';
import { Coin, CoinBalance, SYMBOL } from '@logion/node-api/dist/Balances.js';
import { PrefixedNumber, ATTO } from '@logion/node-api/dist/numbers.js';

import { ColorTheme, rgbaToHex } from './ColorTheme';

export const DEFAULT_LEGAL_OFFICER = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"; // Alice
export const ANOTHER_LEGAL_OFFICER = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"; // Bob
export const A_THIRD_LEGAL_OFFICER = "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y"; // Charlie

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
        hintColor: rgbaToHex('#000000', 0.6),
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

export const DEFAULT_COIN: Coin = {
    id: 'lgnt',
    iconId: 'lgnt',
    iconType: 'svg',
    name: "Logion",
    symbol: SYMBOL
};

export const DEFAULT_COIN_BALANCE: CoinBalance = {
    coin: DEFAULT_COIN,
    balance: new PrefixedNumber("42", ATTO),
    available: new PrefixedNumber("42", ATTO),
    level: 0.1,
};

export const DEFAULT_TRANSACTION: Transaction = {
    id: "id",
    from: "from",
    to: "to",
    pallet: "pallet",
    method: "method",
    transferValue: "420",
    tip: "0",
    fee: "125000",
    reserved: "0",
    total: "125420",
    createdOn: "2021-07-28T12:30:00.000",
    type: "Sent",
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
    address: DEFAULT_LEGAL_OFFICER,
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
    logoUrl: "",
    nodeId: "",
};

export const GUILLAUME: LegalOfficer = {
    name: "Guillaume Grain",
    address: ANOTHER_LEGAL_OFFICER,
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
    logoUrl: "",
    nodeId: "",
};

export const ALAIN: LegalOfficer = {
    name: "Alain Barland",
    address: A_THIRD_LEGAL_OFFICER,
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
    logoUrl: "",
    nodeId: "",
};

export const legalOfficers: LegalOfficer[] = [
    PATRICK,
    GUILLAUME,
    ALAIN
];
