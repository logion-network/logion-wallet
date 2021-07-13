import Identity from './types/Identity';
import PostalAddress from './types/PostalAddress';
import { ColorTheme, rgbaToHex } from '../component/ColorTheme';

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
