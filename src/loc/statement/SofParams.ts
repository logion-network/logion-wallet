import { ItemToken } from "@logion/node-api";

export interface PublicItem {
    description: string;
    content: string;
    timestamp: string;
}

export interface PrivateItem {
    publicDescription: string;
    privateDescription: string;
    hash: string;
    timestamp: string;
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

export interface SofCollectionItemFile {
    name: string;
    contentType: string;
    size: string;
    hash: string;
}

export interface SofCollectionItem {
    id: string;
    description: string;
    addedOn: string;
    files: SofCollectionItemFile[];
    token?: ItemToken;
    restrictedDelivery: boolean;
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
    collectionItem?: SofCollectionItem;
}

interface SettingsData {
    oathText: string;
    oathLogoUrl: string;
}

export interface SofParams extends Prerequisites, LocInfo, FormValues, SettingsData {
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
    prerequisites: [],
    oathText: "",
    oathLogoUrl: "",
}

export interface Prerequisite {
    label: string;
    text: string;
    imageSrc: string;
}
