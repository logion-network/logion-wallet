import { MergedMetadataItem, MergedFile, MergedLink, Fees as ClientFees, toFeesClass, HashString } from "@logion/client";
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
            nature: parameters.nature.validValue(),
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
            newItem: false,
            template: false,
            reviewedOn: locItem?.reviewedOn,
            rejectReason: locItem?.rejectReason,
            acknowledgedByOwner: locItem?.acknowledgedByOwner,
            acknowledgedByVerifiedIssuer: locItem?.acknowledgedByVerifiedIssuer,
        },
        {
            name: locItem.name,
            value: locItem.value,
        }
    );
}

export function createLinkItem(linkItem: LinkData, locLink: MergedLink): ItemAndRefreshFlag {
    if (locLink.published) {
        return createPublishedLinkedLocItem(linkItem, locLink);
    } else {
        const locItem = createDraftLinkedLocItem(linkItem, locLink);
        return { locItem, refreshNeeded: false };
    }
}

export function createDraftLinkedLocItem(
    linkItem: LinkData,
    locItem: MergedLink,
): LocItem {
    return new LinkItem(
        {
            submitter: locItem.submitter,
            timestamp: locItem.addedOn || null,
            type: 'Linked LOC',
            status: locItem?.status || "DRAFT",
            newItem: false,
            template: false,
            reviewedOn: locItem?.reviewedOn,
            rejectReason: locItem?.rejectReason,
            acknowledgedByOwner: locItem?.acknowledgedByOwner,
            acknowledgedByVerifiedIssuer: locItem?.acknowledgedByVerifiedIssuer,
        },
        {
            linkDetailsPath: linkItem.linkDetailsPath,
            linkedLoc: linkItem.linkedLoc,
            nature: linkItem.nature,
        }
    );
}

function createPublishedLinkedLocItem(
    linkItem: LinkData,
    locItem: MergedLink,
): ItemAndRefreshFlag {
    return publish(createDraftLinkedLocItem(linkItem, locItem), locItem.addedOn || null, locItem.fees);
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
            defaultTitle: templateItem.publicDescription,
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
            defaultTitle: templateItem.name,
        },
        locItem ? {
            name: HashString.fromValue(templateItem.name),
            value: locItem.value,
        } : undefined,
    );
}

export function createLinkTemplateItem(
    templateItem: LocTemplateDocumentOrLink,
    locItem?: MergedLink,
    linkData?: LinkData,
): LinkItem {
    return new LinkItem(
        {
            newItem: false,
            status: locItem?.status || "DRAFT",
            submitter: locItem?.submitter,
            timestamp: locItem?.addedOn || null,
            type: "Linked LOC",
            template: true,
            isSet: locItem !== undefined,
            fees: toFeesClass(locItem?.fees),
            reviewedOn: locItem?.reviewedOn,
            rejectReason: locItem?.rejectReason,
            acknowledgedByOwner: locItem?.acknowledgedByOwner,
            acknowledgedByVerifiedIssuer: locItem?.acknowledgedByVerifiedIssuer,
            defaultTitle: templateItem.publicDescription,
        },
        (linkData && locItem) ? {
            nature: templateItem.publicDescription,
            linkDetailsPath: linkData.linkDetailsPath,
            linkedLoc: linkData.linkedLoc,
        } : undefined,
    );
}
