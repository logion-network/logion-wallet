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
    secondaryBackgroundColor: string,
}

export interface SelectColors extends BackgroundAndForegroundColors {
    menuBackgroundColor: string,
    selectedOptionBackgroundColor: string,
}

export interface ColorTheme {
    type: ColorThemeType,
    dashboard: BackgroundAndForegroundColors,
    sidebar: SidebarColors,
    accounts: AccountAddressColors,
    frame: FrameColors,
    topMenuItems: MenuItemColors,
    bottomMenuItems: MenuItemColors,
    shadowColor: string,
    buttons: ButtonsColors,
    select: SelectColors,
}

export interface FrameColors extends BackgroundAndForegroundColors {
    link: string,
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
