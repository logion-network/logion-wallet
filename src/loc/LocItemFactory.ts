import { MergedMetadataItem, MergedFile, MergedLink } from "@logion/client";
import { UUID } from "@logion/node-api";
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
        const locItem = createDraftFileLocItem(file, false);
        return { locItem, refreshNeeded: false };
    }
}

export interface SimpleItem {
    name: string;
    submitter: string;
    addedOn?: string;
}

export interface FileItem extends SimpleItem {
    nature: string;
    hash: string;
}

function createPublishedFileLocItem(parameters: FileItem): ItemAndRefreshFlag {
    return publish(createDraftFileLocItem(parameters, false), parameters.addedOn || null)
}

export function createDraftFileLocItem(parameters: FileItem, newItem: boolean): LocItem {
    return {
        name: parameters.name,
        value: parameters.hash,
        nature: parameters.nature,
        submitter: parameters.submitter,
        timestamp: parameters.addedOn || null,
        type: 'Document',
        status: 'DRAFT',
        newItem,
        template: false,
    };
}

export interface MetadataItem extends SimpleItem {
    value: string;
}

export function createMetadataItem(dataItem: MergedMetadataItem): ItemAndRefreshFlag {
    if (dataItem.published) {
        return createPublishedMetadataLocItem(dataItem);
    } else {
        const locItem = createDraftMetadataLocItem(dataItem, false);
        return { locItem, refreshNeeded: false };
    }
}

export interface CreateLocMetadataItemParameters {
    metadataItem: MetadataItem,
}

function createPublishedMetadataLocItem(parameters: MergedMetadataItem): ItemAndRefreshFlag {
    return publish(createDraftMetadataLocItem(parameters, false), parameters.addedOn || null)
}

export function createDraftMetadataLocItem(metadataItem: MetadataItem, newItem: boolean): LocItem {
    return {
        name: metadataItem.name,
        value: metadataItem.value,
        submitter: metadataItem.submitter,
        timestamp: metadataItem.addedOn || null,
        type: 'Data',
        status: 'DRAFT',
        newItem,
        template: false,
    }
}

export interface SimpleLink {
    id: UUID;
    nature: string;
    addedOn?: string;
    published: boolean;
}

export interface CreateLocLinkedLocItemParameters {
    link: SimpleLink,
    otherLocDescription: string,
    submitter: string,
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

function publish(locItem: LocItem, timestamp: string | null): ItemAndRefreshFlag {
    const publishedLocItem: LocItem = { ...locItem, status: 'PUBLISHED', timestamp };
    return { locItem: publishedLocItem, refreshNeeded: !locItem.timestamp };
}

interface Timestamp {
    timestamp: string | null
}

function createPublishedLinkedLocItem(parameters: CreateLocLinkedLocItemParameters & Timestamp): ItemAndRefreshFlag {
    return publish(createDraftLinkedLocItem(parameters, false), parameters.timestamp);
}

export function createDocumentTemplateItem(templateItem: LocTemplateDocumentOrLink, locItem?: MergedFile): LocItem {
    return {
        name: locItem?.name,
        value: locItem?.hash,
        newItem: false,
        status: locItem && locItem.published ? "PUBLISHED" : "DRAFT",
        submitter: locItem?.submitter,
        timestamp: locItem?.addedOn || null,
        type: "Document",
        template: true,
        nature: templateItem.publicDescription,
        isSet: locItem !== undefined,
    }
}

export function createMetadataTemplateItem(templateItem: LocTemplateMetadataItem, locItem?: MergedMetadataItem): LocItem {
    return {
        name: templateItem.name,
        value: locItem?.value,
        newItem: false,
        status: locItem && locItem.published ? "PUBLISHED" : "DRAFT",
        submitter: locItem?.submitter,
        timestamp: locItem?.addedOn || null,
        type: "Data",
        template: true,
        isSet: locItem !== undefined,
    }
}

export function createLinkTemplateItem(
    ownerAddress: string,
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
    }
}
