import { ItemToken } from "@logion/node-api";
import { LogionClassification, SpecificLicense } from "@logion/client";

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
    logionClassification?: LogionClassification;
    litcUrl: string;
    litcLocUrl: string;
    specificLicenses?: SpecificLicense[];
    creativeCommons?: SofCreativeCommons;
}

export interface SofCreativeCommons {
    code: string;
    url: string;
    badgeUrl: string;
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
    collectionItem?: SofCollectionItem;
}

interface SettingsData {
    logoUrl: string;
    sealUrl: string;
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
    sealUrl: "",
}

export interface Prerequisite {
    label: string;
    text: string;
    imageSrc: string;
}
