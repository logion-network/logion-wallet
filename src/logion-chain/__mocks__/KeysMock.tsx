let extensionAvailable = false;

export function setExtensionAvailable(value: boolean) {
    extensionAvailable = value;
}

export function isExtensionAvailable() {
    return extensionAvailable;
}

let recommendedExtensionValue: any = null;

export function setRecommendedExtension(value: any) {
    recommendedExtensionValue = value;
}

export function recommendedExtension(): any {
    return recommendedExtensionValue;
}
