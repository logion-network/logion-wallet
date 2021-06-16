export type Children = JSX.Element | null | (JSX.Element | null)[];

export interface BackgroundAndForegroundColors {
    background: string,
    foreground: string,
}

export interface GradientData {
    from: string,
    to: string,
}
