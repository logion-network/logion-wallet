import { ColorTheme } from '../component/ColorTheme';

export const LIGHT_MODE: ColorTheme = {
    type: 'light',
    shadowColor: '#3b6cf433',
    dashboard: {
        background: '#ffffff',
        foreground: '#000000',
    },
    menuArea: {
        background: '#152665',
        foreground: '#ffffff',
    },
    accounts: {
        iconBackground: '#3b6cf4',
        hintColor: '#00000066',
        foreground: '#000000',
        background: '#ffffff',
        legalOfficerIcon: {
            category: 'legal-officer',
            id: 'account-shield'
        }
    },
    frame: {
        background: '#3b6cf40f',
        foreground: '#000000',
        link: '#3b6cf466',
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
    }
};