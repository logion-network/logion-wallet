export type Child = JSX.Element | null | boolean | string;
export type Children = Child | Child[] | null ;

export function customClassName(baseClassName: string, ...customClassNames: (string | undefined)[]) {
    let className = baseClassName;
    for(let i = 0; i < customClassNames.length; ++i) {
        const customClassName = customClassNames[i];
        if(customClassName !== undefined) {
            className += " " + customClassName;
        }
    }
    return className;
}

export function toggleClass(toggle: boolean | undefined, className: string): string | undefined {
    return toggle ? className : undefined;
}
