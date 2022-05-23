export interface PublicItem {
    description: string;
    content: string;
}

export interface PrivateItem {
    publicDescription: string;
    privateDescription: string;
    hash: string;
}

export type Language = 'en' | 'fr';

export interface Prerequisites {
    prerequisites: Prerequisite[];
}

export interface FormValues {
    containingLocId: string;
    timestampText: string;
    requesterText: string;
    amount: string;
}

interface LocInfo {
    language: Language;
    polkadotAddress: string;
    postalAddressLine1: string;
    postalAddressLine2: string;
    postalAddressLine3: string;
    postalAddressLine4: string;
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    shortPostalAddress: string;
    requester: string;
    nodeAddress: string;
    locId: string;
    certificateUrl: string;
    publicItems: PublicItem[];
    privateItems: PrivateItem[];
    logoUrl: string;
    itemId: string;
    itemDescription: string;
}

export interface SofParams extends Prerequisites, LocInfo, FormValues {
}

export const DEFAULT_SOF_PARAMS: SofParams = {
    language: "en",
    polkadotAddress: "",
    postalAddressLine1: "",
    postalAddressLine2: "",
    postalAddressLine3: "",
    postalAddressLine4: "",
    email: "",
    firstName: "",
    lastName: "",
    company: "",
    shortPostalAddress: "",
    requester: "",
    nodeAddress: "",
    locId: "",
    certificateUrl: "",
    publicItems: [],
    privateItems: [],
    logoUrl: "",
    containingLocId: "",
    timestampText: "",
    requesterText: "",
    amount: "",
    itemId: "",
    itemDescription: "",
    prerequisites: [],
}

export interface Prerequisite {
    label: string;
    text: string;
    imageSrc: string;
}
