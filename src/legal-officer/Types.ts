import { ProtectionRequest } from '@logion/client/dist/RecoveryClient.js';

import { ColorTheme, rgbaToHex } from '../common/ColorTheme';

export interface RecoveryInfo {
    addressToRecover: string,
    recoveryAccount: ProtectionRequest,
    accountToRecover?: ProtectionRequest,
}

export const LIGHT_MODE: ColorTheme = {
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
        background: '#eff3fe',
        legalOfficerIcon: {
            category: 'legal-officer',
            id: 'account-shield'
        }
    },
    frame: {
        background: '#ffffff',
        foreground: '#000000',
        link: '#0d6efd',
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
            from: '#e95b5b',
            to: '#6050dc',
        }
    },
    buttons: {
        secondary: {
            background: '#ffffff',
            foreground: '#000000',
        }
    },
    select: {
        background: '#d8e2fd',
        foreground: '#000000',
        menuBackgroundColor: '#d8e2fd',
        selectedOptionBackgroundColor: rgbaToHex('#ffffff', 0.20),
    },
    table: {
        background: '#ffffff',
        foreground: '#000000',
        header: {
            background: '#ffffff',
            foreground: rgbaToHex('#000000', 0.70),
        },
        row: {
            background: '#eff3fe',
            foreground: '#000000',
        }
    },
    tabs: {
        background: '#ffffff',
        foreground: '#000000',
        inactiveTab: {
            background: '#eff3fe',
            foreground: rgbaToHex('#000000', 0.70),
        },
        borderColor: '#3b6cf4',
    },
    dialog: {
        background: '#ffffff',
        foreground: '#000000',
        borderColor: '#e6007a',
    },
    dialogTable: {
        background: '#ffffff',
        foreground: '#000000',
        header: {
            background: '#ffffff',
            foreground: rgbaToHex('#000000', 0.70),
        },
        row: {
            background: '#eff3fe',
            foreground: '#000000',
        }
    },
};
