export interface BackgroundAndForegroundColors {
    background: string,
    foreground: string,
}

export interface GradientData {
    from: string,
    to: string,
}

export type ColorThemeType = 'light' | 'dark';

export interface ButtonsColors {
    secondary: BackgroundAndForegroundColors,
}

export interface SelectColors extends BackgroundAndForegroundColors {
    menuBackgroundColor: string,
    selectedOptionBackgroundColor: string,
}

export interface TableColors extends BackgroundAndForegroundColors {
    header: BackgroundAndForegroundColors,
    row: BackgroundAndForegroundColors,
}

export interface TabsColors extends BackgroundAndForegroundColors {
    inactiveTab: BackgroundAndForegroundColors,
    borderColor: string,
}

export interface DialogColors extends BackgroundAndForegroundColors {
    borderColor: string,
}

export interface ColorTheme {
    type: ColorThemeType,
    dashboard: BackgroundAndForegroundColors,
    sidebar: SidebarColors,
    accounts: AccountAddressColors,
    frame: FrameColors,
    topMenuItems: MenuItemColors,
    bottomMenuItems: MenuItemColors,
    recoveryItems: MenuItemColors,
    shadowColor: string,
    buttons: ButtonsColors,
    select: SelectColors,
    table: TableColors,
    tabs: TabsColors,
    dialog: DialogColors,
    dialogTable: TableColors,
}

export interface FrameColors extends BackgroundAndForegroundColors {
    link: string,
    altBackground?: string,
}

export interface MenuItemColors {
    iconGradient: GradientData,
}

export interface SidebarColors extends BackgroundAndForegroundColors {
    activeItemBackground: string,
}

export interface AccountAddressColors extends BackgroundAndForegroundColors {
    iconBackground: string,
    hintColor: string,
    legalOfficerIcon: Icon,
}

export interface Icon {
    category?: string,
    id: string,
    hasVariants?: boolean,
}

export interface MenuIcon {
    background?: GradientData,
    icon?: Icon,
    height?: string,
    width?: string,
}

export function rgbaToHex(color: string, alpha: number): string {
    if(alpha < 0 || alpha > 1) {
        throw new Error("alpha must be a number between 0 and 1 inclusive");
    }
    let alphaByte = Math.round(alpha * 255);
    let alphaHex = alphaByte.toString(16);
    if(alphaHex.length === 1) {
        return color + '0' + alphaHex;
    } else {
        return color + alphaHex;
    }
}

export const ORANGE: string = "#ff9b3f";
export const RED: string = "#e11a25";
export const GREEN: string = "#37ad4b";
export const BLUE: string = "#3b6cf4";
export const YELLOW: string = "#f0c300";
export const POLKADOT: string = "#e6007a";

export const DEFAULT_COLOR_THEME: ColorTheme = {
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
            background: '#152665',
            foreground: '#ffffff',
        },
        row: {
            background: '#0c163d',
            foreground: '#ffffff',
        }
    },
};
