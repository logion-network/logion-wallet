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
    menuArea: MenuAreaColors,
    primaryArea: PrimaryAreaColors,
    secondaryArea: BackgroundAndForegroundColors,
    accounts: AccountAddressColors,
    frame: BackgroundAndForegroundColors,
    topMenu: MenuItemColors,
    bottomMenu: MenuItemColors,
    shadowColor: string,
}

export interface PrimaryAreaColors extends BackgroundAndForegroundColors {
    link: string,
}

export interface MenuAreaColors extends BackgroundAndForegroundColors {
    
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
