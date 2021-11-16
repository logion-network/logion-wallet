import { Coin, CoinBalance, SYMBOL } from '../logion-chain/Balances';
import { PrefixedNumber, ATTO } from '../logion-chain/numbers';

import Identity from './types/Identity';
import PostalAddress from './types/PostalAddress';
import { Transaction } from './types/ModelTypes';
import { ColorTheme, rgbaToHex } from './ColorTheme';

export const DEFAULT_LEGAL_OFFICER = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"; // Alice
export const ANOTHER_LEGAL_OFFICER = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"; // Bob
export const A_THIRD_LEGAL_OFFICER = "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y"; // Charlie

export const DEFAULT_IDENTITY: Identity = {
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
};

export const DEFAULT_COIN: Coin = {
    id: 'log',
    iconId: 'log',
    iconType: 'png',
    name: "Logion",
    symbol: SYMBOL
};

export const DEFAULT_COIN_BALANCE: CoinBalance = {
    coin: DEFAULT_COIN,
    balance: new PrefixedNumber("42", ATTO),
    level: 0.1,
};

export const DEFAULT_TRANSACTION: Transaction = {
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
}
