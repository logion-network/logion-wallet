let browserName: string | null = null;

export function setBrowser(name: string | null) {
    browserName = name;
}

export function detect(): object | null {
    if(browserName === null) {
        return null;
    } else {
        return {
            name: browserName
        };
    }
}
