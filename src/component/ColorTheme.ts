export interface BackgroundAndForegroundColors {
    background: string,
    foreground: string,
}

export interface GradientData {
    from: string,
    to: string,
}

export type ColorThemeType = 'light' | 'dark';

export interface ColorTheme {
    type: ColorThemeType,
    dashboard: BackgroundAndForegroundColors,
    menuArea: BackgroundAndForegroundColors,
    accounts: AccountAddressColors,
    frame: FrameColors,
    topMenuItems: MenuItemColors,
    bottomMenuItems: MenuItemColors,
    shadowColor: string,
}

export interface FrameColors extends BackgroundAndForegroundColors {
    link: string,
}

export interface MenuItemColors {
    iconGradient: GradientData,
}

export interface AccountAddressColors extends BackgroundAndForegroundColors {
    iconBackground: string,
    hintColor: string,
    legalOfficerIcon: Icon,
}

export interface Icon {
    category: string,
    id: string,
}

export interface MenuIcon {
    background?: GradientData,
    icon?: Icon,
    height?: string,
    width?: string,
}
