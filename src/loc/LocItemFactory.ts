import { MergedMetadataItem, MergedFile } from "@logion/client";
import { UUID } from "@logion/node-api";
import { LocItem } from "./types";

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
        timestamp: null,
        type: 'Document',
        status: 'DRAFT',
        newItem,
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
        timestamp: null,
        type: 'Data',
        status: 'DRAFT',
        newItem
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
        timestamp: null,
        type: 'Linked LOC',
        status: 'DRAFT',
        target: link.id,
        nature: link.nature,
        linkDetailsPath,
        newItem,
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
