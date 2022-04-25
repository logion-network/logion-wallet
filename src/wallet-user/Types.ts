import { ColorTheme, rgbaToHex } from '../common/ColorTheme';

export const DARK_MODE: ColorTheme = {
    type: 'dark',
    shadowColor: rgbaToHex('#3b6cf4', 0.2),
    dashboard: {
        background: '#0c163d',
        foreground: '#ffffff',
    },
    sidebar: {
        background: '#152665',
        foreground: '#ffffff',
        activeItemBackground: rgbaToHex('#ffffff', 0.20),
    },
    accounts: {
        iconBackground: '#3b6cf4',
        hintColor: rgbaToHex('#ffffff', 0.6),
        foreground: '#ffffff',
        background: '#0c163d',
        legalOfficerIcon: {
            category: 'legal-officer',
            id: 'account-shield'
        }
    },
    frame: {
        background: '#152665',
        foreground: '#ffffff',
        link: '#ffffff',
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
            background: '#0c163d',
            foreground: '#ffffff',
        }
    },
    select: {
        background: rgbaToHex('#ffffff', 0.20),
        foreground: '#ffffff',
        menuBackgroundColor: '#152665',
        selectedOptionBackgroundColor: rgbaToHex('#ffffff', 0.20),
    },
    table: {
        background: '#152665',
        foreground: '#ffffff',
        header: {
            background: '#152665',
            foreground: '#ffffff',
        },
        row: {
            background: '#0c163d',
            foreground: '#ffffff',
        }
    },
    tabs: {
        background: '#152665',
        foreground: '#ffffff',
        inactiveTab: {
            background: rgbaToHex('#ffffff', 0.20),
            foreground: '#ffffff',
        },
        borderColor: '#3b6cf4',
    },
    dialog: {
        background: '#0c163d',
        foreground: '#ffffff',
        borderColor: '#e6007a',
    },
    dialogTable: {
        background: '#152665',
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
