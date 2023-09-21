import { MergedMetadataItem, MergedFile, MergedLink, Fees as ClientFees, toFeesClass } from "@logion/client";
import { ValidAccountId } from "@logion/node-api";
import { FileItem, LinkData, LinkItem, LocItem, MetadataItem } from "./LocItem";
import { LocTemplateDocumentOrLink, LocTemplateMetadataItem } from "./Template";

export interface ItemAndRefreshFlag {
    locItem: LocItem,
    refreshNeeded: boolean
}

export function createFileItem(file: MergedFile): ItemAndRefreshFlag {
    if (file.published) {
        return createPublishedFileLocItem(file)
    } else {
        const locItem = createDraftFileLocItem(file);
        return { locItem, refreshNeeded: false };
    }
}

function createPublishedFileLocItem(parameters: MergedFile): ItemAndRefreshFlag {
    return publish(createDraftFileLocItem(parameters), parameters.addedOn || null, parameters.fees, parameters.storageFeePaidBy);
}

function publish(locItem: LocItem, timestamp: string | null, fees?: ClientFees, storageFeePaidBy?: string): ItemAndRefreshFlag {
    return {
        locItem: locItem.publish(timestamp, toFeesClass(fees), storageFeePaidBy),
        refreshNeeded: !locItem.timestamp
    };
}

function createDraftFileLocItem(parameters: MergedFile): FileItem {
    return new FileItem(
        {
            submitter: parameters.submitter,
            timestamp: parameters.addedOn || null,
            type: 'Document',
            status: parameters.status || "DRAFT",
            newItem: false,
            template: false,
            reviewedOn: parameters.reviewedOn,
            rejectReason: parameters.rejectReason,
            acknowledgedByOwner: parameters.acknowledgedByOwner,
            acknowledgedByVerifiedIssuer: parameters.acknowledgedByVerifiedIssuer,
        },
        {
            hash: parameters.hash,
            fileName: parameters.name,
            nature: parameters.nature,
            size: parameters.size,
            storageFeePaidBy: parameters.storageFeePaidBy || "",
        }
    );
}

export function createMetadataItem(dataItem: MergedMetadataItem): ItemAndRefreshFlag {
    if (dataItem.published) {
        return createPublishedMetadataLocItem(dataItem);
    } else {
        const locItem = createDraftMetadataLocItem(dataItem);
        return { locItem, refreshNeeded: false };
    }
}

function createPublishedMetadataLocItem(parameters: MergedMetadataItem): ItemAndRefreshFlag {
    return publish(createDraftMetadataLocItem(parameters), parameters.addedOn || null, parameters.fees)
}

function createDraftMetadataLocItem(locItem: MergedMetadataItem): LocItem {
    return new MetadataItem(
        {
            submitter: locItem.submitter,
            timestamp: locItem.addedOn || null,
            type: 'Data',
            status: locItem?.status || "DRAFT",
            newItem: locItem === undefined,
            template: false,
            reviewedOn: locItem?.reviewedOn,
            rejectReason: locItem?.rejectReason,
            acknowledgedByOwner: locItem?.acknowledgedByOwner,
            acknowledgedByVerifiedIssuer: locItem?.acknowledgedByVerifiedIssuer,
        },
        {
            name: locItem.name,
            nameHash: locItem.nameHash,
            value: locItem.value,
        }
    );
}

export function createLinkItem(submitter: ValidAccountId, linkItem: LinkData, locLink: MergedLink): ItemAndRefreshFlag {
    // if (linkItem.published) { // TODO: uncomment this
    //     return createPublishedLinkedLocItem(submitter, linkItem, locLink);
    // } else {
        const locItem = createDraftLinkedLocItem(submitter, linkItem, locLink);
        return { locItem, refreshNeeded: false };
    // }
}

export function createDraftLinkedLocItem(
    submitter: ValidAccountId, // TODO: remove this
    linkItem: LinkData,
    locItem: MergedLink,
): LocItem {
    return new LinkItem(
        {
            // submitter: locItem.submitter, // TODO: uncomment this
            submitter, // TODO: remove this
            timestamp: locItem.addedOn || null,
            type: 'Linked LOC',
            // status: locItem?.status || "DRAFT", // TODO: uncomment this
            status: "DRAFT", // TODO: remove this
            newItem: locItem === undefined,
            template: false,
            // reviewedOn: locItem?.reviewedOn, // TODO: uncomment this
            // rejectReason: locItem?.rejectReason, // TODO: uncomment this
            // acknowledgedByOwner: locItem?.acknowledgedByOwner, // TODO: uncomment this
            // acknowledgedByVerifiedIssuer: locItem?.acknowledgedByVerifiedIssuer, // TODO: uncomment this
        },
        {
            linkDetailsPath: linkItem.linkDetailsPath,
            linkedLoc: linkItem.linkedLoc,
            nature: linkItem.nature,
        }
    );
}

export function createPublishedLinkedLocItem( // TODO: do not export (used by createLinkItem only)
    submitter: ValidAccountId, // TODO: remove this
    linkItem: LinkData,
    locItem: MergedLink,
): ItemAndRefreshFlag {
    return publish(createDraftLinkedLocItem(submitter, linkItem, locItem), null, undefined) // TODO: take addedOn and fees from locItem
}

export function createDocumentTemplateItem(templateItem: LocTemplateDocumentOrLink, locItem?: MergedFile): FileItem {
    return new FileItem(
        {
            newItem: false,
            status: locItem?.status || "DRAFT",
            submitter: locItem?.submitter,
            timestamp: locItem?.addedOn || null,
            type: "Document",
            template: true,
            isSet: locItem !== undefined,
            fees: toFeesClass(locItem?.fees),
            reviewedOn: locItem?.reviewedOn,
            rejectReason: locItem?.rejectReason,
            acknowledgedByOwner: locItem?.acknowledgedByOwner,
            acknowledgedByVerifiedIssuer: locItem?.acknowledgedByVerifiedIssuer,
        },
        locItem ? {
            fileName: locItem.name,
            hash: locItem.hash,
            nature: templateItem.publicDescription,
            size: locItem.size,
            storageFeePaidBy: locItem.storageFeePaidBy || "",
        } : undefined,
    );
}

export function createMetadataTemplateItem(templateItem: LocTemplateMetadataItem, locItem?: MergedMetadataItem): MetadataItem {
    return new MetadataItem(
        {
            newItem: false,
            status: locItem?.status || "DRAFT",
            submitter: locItem?.submitter,
            timestamp: locItem?.addedOn || null,
            type: "Data",
            template: true,
            isSet: locItem !== undefined,
            fees: toFeesClass(locItem?.fees),
            reviewedOn: locItem?.reviewedOn,
            rejectReason: locItem?.rejectReason,
            acknowledgedByOwner: locItem?.acknowledgedByOwner,
            acknowledgedByVerifiedIssuer: locItem?.acknowledgedByVerifiedIssuer,
        },
        locItem ? {
            nameHash: locItem.nameHash,
            name: templateItem.name,
            value: locItem.value,
        } : undefined,
    );
}

export function createLinkTemplateItem(
    submitter: ValidAccountId, // TODO: remove this (will come from locItem)
    templateItem: LocTemplateDocumentOrLink,
    locItem?: MergedLink,
    linkData?: LinkData,
): LinkItem {
    return new LinkItem(
        {
            newItem: false,
            // status: locItem?.status || "DRAFT", // TODO: keep this
            // submitter: locItem?.submitter, // TODO: keep this
            status: locItem && locItem.published ? "ACKNOWLEDGED" : "DRAFT", // TODO: remove this
            submitter, // TODO: remove this
            timestamp: locItem?.addedOn || null,
            type: "Linked LOC",
            template: true,
            isSet: locItem !== undefined,
            fees: toFeesClass(locItem?.fees),
            // reviewedOn: locItem?.reviewedOn, // TODO: uncomment this
            // rejectReason: locItem?.rejectReason, // TODO: uncomment this
            // acknowledgedByOwner: locItem?.acknowledgedByOwner, // TODO: uncomment this
            // acknowledgedByVerifiedIssuer: locItem?.acknowledgedByVerifiedIssuer, // TODO: uncomment this
        },
        (linkData && locItem) ? {
            nature: templateItem.publicDescription,
            linkDetailsPath: linkData.linkDetailsPath,
            linkedLoc: linkData.linkedLoc,
        } : undefined,
    );
}
