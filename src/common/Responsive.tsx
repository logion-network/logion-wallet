export interface ResponsiveWidthParameters extends Record<string, string> {
    default: string;
}

export function responsiveWidth(parameters: ResponsiveWidthParameters): string {
    for(const key in parameters) {
        if(isActiveMaxWidthRule(key)) {
            return parameters[key];
        }
    }
    const defaultWidth = parameters["default"];
    if(defaultWidth === undefined)  {
        throw new Error("No matching rule found");
    } else {
        return defaultWidth;
    }
}

function isActiveMaxWidthRule(rule: string): boolean {
    if(rule.startsWith("max-width:")) {
        let maxWidthString = rule.substring("max-width:".length).trim();
        if(maxWidthString.endsWith("px")) {
            maxWidthString = maxWidthString.substring(0, maxWidthString.length - 2).trim();
        }
        const maxWidth = Number(maxWidthString);
        const screenWidth = window.screen.availWidth;
        return screenWidth <= maxWidth;
    } else {
        return false;
    }
}
