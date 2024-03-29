import { SpecificLicense } from "@logion/client";

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
    deliveries: SofFileDelivery[];
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

export interface SofFileDelivery {
    hash: string;
    owner: string;
}

export interface SofDeliverableFile {
    name: string;
    contentType: string;
    size: string;
    hash: string;
    deliveries: SofFileDelivery[];
}

export interface SofLogionClassification {
    locId: string;
    details: string,
}

export interface SofCollectionItem {
    id: string;
    description: string;
    addedOn: string;
    files: SofDeliverableFile[];
    token?: SofItemToken;
    restrictedDelivery: boolean;
    logionClassification?: SofLogionClassification;
    litcUrl: string;
    litcLocUrl: string;
    specificLicenses?: SpecificLicense[];
    creativeCommons?: SofCreativeCommons;
}

export interface SofItemToken {
    type: string;
    id: string;
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
    tokensRecords: SofTokensRecord[];
}

interface SettingsData {
    logoUrl: string;
    sealUrl: string;
    oathText: string;
    oathLogoUrl: string;
}

export interface SofTokensRecord {
    id: string;
    description: string;
    addedOn: string;
    files: SofDeliverableFile[];
    issuer: string;
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
    tokensRecords: [],
}

export interface Prerequisite {
    label: string;
    text: string;
    imageSrc: string;
}
