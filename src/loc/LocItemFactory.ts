import { MergedMetadataItem, MergedFile, MergedLink, Fees as ClientFees } from "@logion/client";
import { UUID, Fees, ValidAccountId } from "@logion/node-api";
import { LinkData, LocItem } from "./LocItem";
import { LocTemplateDocumentOrLink, LocTemplateMetadataItem } from "./Template";

export interface ItemAndRefreshFlag {
    locItem: LocItem,
    refreshNeeded: boolean
}

export function createFileItem(file: MergedFile): ItemAndRefreshFlag {
    if (file.published) {
        return createPublishedFileLocItem(file)
    } else {
        const locItem = createDraftFileLocItem(file, file);
        return { locItem, refreshNeeded: false };
    }
}

export interface SimpleItem {
    name: string;
    submitter: ValidAccountId;
    addedOn?: string;
}

export interface FileItem extends SimpleItem {
    nature: string;
    hash: string;
    size: bigint;
    fees?: ClientFees;
    storageFeePaidBy?: string;
}

function createPublishedFileLocItem(parameters: MergedFile): ItemAndRefreshFlag {
    return publish(createDraftFileLocItem(parameters, parameters), parameters.addedOn || null, parameters.fees, parameters.storageFeePaidBy)
}

export function createDraftFileLocItem(parameters: FileItem, locItem?: MergedFile): LocItem {
    return {
        name: parameters.name,
        value: parameters.hash,
        nature: parameters.nature,
        submitter: parameters.submitter,
        timestamp: parameters.addedOn || null,
        type: 'Document',
        status: locItem?.status || "DRAFT",
        newItem: locItem === undefined,
        template: false,
        size: parameters.size,
        reviewedOn: locItem?.reviewedOn,
    };
}

export interface MetadataItem extends SimpleItem {
    value: string;
}

export function createMetadataItem(dataItem: MergedMetadataItem): ItemAndRefreshFlag {
    if (dataItem.published) {
        return createPublishedMetadataLocItem(dataItem);
    } else {
        const locItem = createDraftMetadataLocItem(dataItem, dataItem);
        return { locItem, refreshNeeded: false };
    }
}

export interface CreateLocMetadataItemParameters {
    metadataItem: MetadataItem,
}

function createPublishedMetadataLocItem(parameters: MergedMetadataItem): ItemAndRefreshFlag {
    return publish(createDraftMetadataLocItem(parameters, parameters), parameters.addedOn || null, parameters.fees)
}

export function createDraftMetadataLocItem(metadataItem: MetadataItem, locItem?: MergedMetadataItem): LocItem {
    return {
        name: metadataItem.name,
        nature: metadataItem.name,
        value: metadataItem.value,
        submitter: metadataItem.submitter,
        timestamp: metadataItem.addedOn || null,
        type: 'Data',
        status: locItem?.status || "DRAFT",
        newItem: locItem === undefined,
        template: false,
        reviewedOn: locItem?.reviewedOn,
    }
}

export interface SimpleLink {
    id: UUID;
    nature: string;
    addedOn?: string;
    published: boolean;
    fees?: ClientFees;
}

export interface CreateLocLinkedLocItemParameters {
    link: SimpleLink,
    otherLocDescription: string,
    submitter: ValidAccountId,
    linkDetailsPath: string,
}

export function createLinkItem(parameters: CreateLocLinkedLocItemParameters): ItemAndRefreshFlag {
    const { link, otherLocDescription, submitter, linkDetailsPath } = parameters;
    if (link.published) {
        return createPublishedLinkedLocItem({
            link,
            otherLocDescription,
            submitter,
            timestamp: link.addedOn!,
            linkDetailsPath,
        });
    } else {
        const locItem = createDraftLinkedLocItem({
            link,
            otherLocDescription,
            submitter,
            linkDetailsPath,
        }, false);
        return { locItem, refreshNeeded: false };
    }
}

export function createDraftLinkedLocItem(parameters: CreateLocLinkedLocItemParameters, newItem: boolean): LocItem {
    const { link, otherLocDescription, submitter, linkDetailsPath } = parameters;
    return {
        name: otherLocDescription,
        value: link.id.toDecimalString(),
        submitter,
        timestamp: parameters.link.addedOn || null,
        type: 'Linked LOC',
        status: 'DRAFT',
        target: link.id,
        nature: link.nature,
        linkDetailsPath,
        newItem,
        template: false,
    };
}

function publish(locItem: LocItem, timestamp: string | null, fees?: ClientFees, storageFeePaidBy?: string): ItemAndRefreshFlag {
    const publishedLocItem: LocItem = {
        ...locItem,
        timestamp,
        fees: toFeesClass(fees),
        storageFeePaidBy,
    };
    return {
        locItem: publishedLocItem,
        refreshNeeded: !locItem.timestamp
    };
}

interface Timestamp {
    timestamp: string | null
}

function createPublishedLinkedLocItem(parameters: CreateLocLinkedLocItemParameters & Timestamp): ItemAndRefreshFlag {
    return publish(createDraftLinkedLocItem(parameters, false), parameters.timestamp, parameters.link.fees);
}

export function createDocumentTemplateItem(templateItem: LocTemplateDocumentOrLink, locItem?: MergedFile): LocItem {
    return {
        name: locItem?.name,
        value: locItem?.hash,
        newItem: false,
        status: locItem?.status || "DRAFT",
        submitter: locItem?.submitter,
        timestamp: locItem?.addedOn || null,
        type: "Document",
        template: true,
        nature: templateItem.publicDescription,
        isSet: locItem !== undefined,
        size: locItem?.size,
        fees: toFeesClass(locItem?.fees),
        storageFeePaidBy: locItem?.storageFeePaidBy,
        reviewedOn: locItem?.reviewedOn,
    }
}

function toFeesClass(fees: ClientFees | undefined): Fees | undefined {
    if(fees) {
        return new Fees(
            BigInt(fees.inclusion),
            fees.storage ? BigInt(fees.storage) : undefined,
        );
    } else {
        return undefined;
    }
}

export function createMetadataTemplateItem(templateItem: LocTemplateMetadataItem, locItem?: MergedMetadataItem): LocItem {
    return {
        name: templateItem.name,
        nature: templateItem.name,
        value: locItem?.value,
        newItem: false,
        status: locItem?.status || "DRAFT",
        submitter: locItem?.submitter,
        timestamp: locItem?.addedOn || null,
        type: "Data",
        template: true,
        isSet: locItem !== undefined,
        fees: toFeesClass(locItem?.fees),
        reviewedOn: locItem?.reviewedOn,
    }
}

export function createLinkTemplateItem(
    ownerAddress: ValidAccountId,
    templateItem: LocTemplateDocumentOrLink,
    locItem?: MergedLink,
    linkData?: LinkData,
): LocItem {
    return {
        name: linkData?.linkedLoc.description,
        value: locItem?.id.toDecimalString(),
        newItem: false,
        status: locItem && locItem.published ? "PUBLISHED" : "DRAFT",
        submitter: locItem ? ownerAddress : undefined,
        timestamp: locItem?.addedOn || null,
        type: "Linked LOC",
        template: true,
        nature: templateItem.publicDescription,
        isSet: locItem !== undefined,
        linkDetailsPath: linkData?.linkDetailsPath,
        target: linkData?.linkedLoc.id,
        fees: toFeesClass(locItem?.fees),
    }
}
