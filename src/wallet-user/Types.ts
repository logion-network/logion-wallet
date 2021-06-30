import { ColorTheme, rgbaToHex } from '../component/ColorTheme';

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
    buttons: {
        secondaryBackgroundColor: '#0c163d',
    },
    select: {
        background: rgbaToHex('#ffffff', 0.20),
        foreground: '#ffffff',
        menuBackgroundColor: '#152665',
        selectedOptionBackgroundColor: rgbaToHex('#ffffff', 0.20),
    },
};