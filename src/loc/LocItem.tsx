import { LogionClient, LocRequestState, LocData, LocsState, EditableRequest, MergedLink, PublicLoc } from "@logion/client";
import { UUID, LocType, Fees, ValidAccountId } from "@logion/node-api";
import { useCallback } from "react";
import { CallCallback } from "src/ClientExtrinsicSubmitter";
import { POLKADOT } from "src/common/ColorTheme";
import { Viewer } from "src/common/CommonContext";
import { isGrantedAccess } from "src/common/Model";
import { Rules } from "src/common/Responsive";
import StatusCell from "src/common/StatusCell";
import SubmitterName from "src/common/SubmitterName";
import { Cell, Column, DateTimeCell } from "src/common/Table";
import { Child } from "src/common/types/Helpers";
import ViewFileButton from "src/common/ViewFileButton";
import { deleteLink } from "src/legal-officer/client";
import { documentClaimHistoryPath } from "src/legal-officer/LegalOfficerPaths";
import { fullCertificateUrl } from "src/PublicPaths";
import { documentClaimHistoryPath as userDocumentClaimHistoryPath } from "src/wallet-user/UserRouter";
import LocLinkDetails from "./LocLinkDetails";
import LocPrivateFileDetails from "./LocPrivateFileDetails";
import LocPublicDataDetails from "./LocPublicDataDetails";
import RestrictedDeliveryCell from "./RestricedDeliveryCell";
import { ContributionMode } from "./types";

export type LocItemStatus = 'DRAFT' | 'PUBLISHED'

export type LocItemType = 'Data' | 'Document' | 'Linked LOC'

export interface LocItem {
    name: string | undefined,
    value: string | undefined,
    timestamp: string | null,
    type: LocItemType,
    submitter: ValidAccountId | undefined,
    status: LocItemStatus,
    nature?: string,
    target?: UUID,
    newItem: boolean,
    linkDetailsPath?: string,
    template: boolean,
    isSet?: boolean,
    size?: bigint,
    fees?: Fees,
    storageFeePaidBy?: string;
}

export enum PublishStatus {
    NONE,
    START,
    PUBLISH_PENDING,
    PUBLISHING,
    PUBLISHED,
    ERROR
}

export interface PublishState {
    status: PublishStatus;
}

export interface PublishProps {
    locItem: LocItem;
    itemType: 'Public Data' | 'Document' | 'Link';
    publishMutator: (current: LocRequestState, callback: CallCallback) => Promise<LocRequestState>;
    feesEstimator: () => Promise<Fees>;
}

export function buildItemTableColumns(args: {
    loc: LocData,
    locState: LocRequestState,
    width: (rule: Rules) => string,
    currentAddress: string | undefined,
    contributionMode: ContributionMode | undefined,
    viewer: Viewer,
    renderActions: (locItem: LocItem, locId: UUID) => Child,
}): Column<LocItem>[] {
    const {
        loc,
        locState,
        width,
        currentAddress,
        contributionMode,
        viewer,
        renderActions,
    } = args;
    let columns: Column<LocItem>[] = [
        {
            header: "Public description",
            render: locItem => <Cell content={ locItem.nature || "-" } overflowing tooltipId={`${loc.id}-name-tooltip`}/>,
            renderDetails: locItem => renderDetails(loc, locItem, viewer),
            detailsExpanded: locItem => locItem.newItem || (locItem.template && (viewer !== "LegalOfficer" || locItem.status !== "PUBLISHED")),
            hideExpand: locItem => locItem.template && viewer !== "LegalOfficer",
            align: "left",
            width: width({
                onSmallScreen: '150px',
                otherwise: '250px'
            }),
        },
        {
            header: "Timestamp",
            render: locItem => <DateTimeCell
                dateTime={ locItem.timestamp }
                spinner={ locItem.status === 'PUBLISHED' } />,
            width: width({
                onSmallScreen: '100px',
                otherwise: '200px'
            }),
        },
        {
            header: "Type",
            render: locItem => <Cell content={
                <>
                    <span className="item-type">{ locItem.type }</span> {
                    locItem.type === 'Document' && locItem.name && canViewFile(currentAddress, locItem, contributionMode) &&
                    <ViewFileButton
                        nodeOwner={ loc.ownerAddress }
                        fileName={ locItem.name }
                        downloader={ () => locState?.getFile(locItem.value || "") }
                    />
                }
                </> } />,
            width: "160px",
            align: "left"
        },
        {
            header: "Submitted by",
            render: locItem => <SubmitterName loc={ loc } submitter={ locItem.submitter?.address } />,
        }
    ];

    if(loc.locType === "Collection" && viewer === "LegalOfficer") {
        columns.push({
            header: "Restricted Delivery?",
            render: locItem => locItem.type === "Document" && locItem.value ? <RestrictedDeliveryCell hash={ locItem.value }/> : null,
            width: "130px",
        });
    }

    columns = columns.concat([
        {
            header: "",
            render: locItem => {
                if (locItem.status === 'DRAFT') {
                    return renderActions(locItem, loc.id)
                } else {
                    return (
                        <StatusCell icon={ { id: 'published' } } text="Published" color={ POLKADOT } />)
                }
            },
            width: width({
                onSmallScreen: viewer === "LegalOfficer" ? '345px' : '145px',
                otherwise: '400px'
            }),
        }
    ]);
    return columns;
}

function renderDetails(loc: LocData | undefined, locItem: LocItem, viewer: Viewer): Child {
    return (
        <>
            { locItem.type === 'Data' && <LocPublicDataDetails item={ locItem } /> }
            {
                locItem.type === 'Document' &&
                <LocPrivateFileDetails
                    item={ locItem }
                    documentClaimHistory={ loc?.locType === "Collection" && locItem.value && !locItem.template ? documentClaimHistory(viewer, loc, locItem.value) : undefined }
                    storageFeePaidByRequester={ loc?.requesterLocId === undefined }
                />
            }
            { locItem.type === 'Linked LOC' && <LocLinkDetails item={ locItem } /> }
        </>
    )
}

function canViewFile(address: string | undefined, item: LocItem, contributionMode?: ContributionMode): boolean {
    return (contributionMode !== 'VTP' || item.submitter === address) && isSet(item);
}

function isSet(item: LocItem) {
    return (!item.template || item.isSet === true);
}

function documentClaimHistory(viewer: Viewer, loc: LocData | null, hash: string) {
    if(!loc) {
        return "";
    } else if(viewer === "LegalOfficer") {
        return documentClaimHistoryPath(loc.id, hash);
    } else {
        return userDocumentClaimHistoryPath(loc.id, hash);
    }
}

export function useDeleteMetadataCallback(mutateLocState: (mutator: (current: LocRequestState) => Promise<LocRequestState | LocsState>) => Promise<void>) {
    return useCallback(async (item: LocItem) => {
        await mutateLocState(async current => {
            if(current instanceof EditableRequest) {
                return current.deleteMetadata({
                    name: item.name || "",
                });
            } else {
                return current;
            }
        });
    }, [ mutateLocState ]);
}

export function useDeleteFileCallback(mutateLocState: (mutator: (current: LocRequestState) => Promise<LocRequestState | LocsState>) => Promise<void>) {
    return useCallback(async (item: LocItem) => {
        await mutateLocState(async current => {
            if(current instanceof EditableRequest) {
                return current.deleteFile({
                    hash: item.value || "",
                });
            } else {
                return current;
            }
        });
    }, [ mutateLocState ]);
}

export function useDeleteLinkCallback(mutateLocState: (mutator: (current: LocRequestState) => Promise<LocRequestState | LocsState>) => Promise<void>) {
    return useCallback(async (item: LocItem) => {
        await mutateLocState(async current => {
            if(current instanceof EditableRequest) {
                return deleteLink({
                    locState: current,
                    target: item.target!,
                });
            } else {
                return current;
            }
        });
    }, [ mutateLocState ]);
}

export function canDelete(account: ValidAccountId | undefined, item: LocItem, viewer: Viewer, loc: LocData): boolean {
    if (item.type === "Linked LOC") {
        return viewer === "LegalOfficer";
    } else {
        return (viewer === "User" && item.submitter?.address === account?.address && item.submitter?.type === account?.type && (loc.status === "DRAFT" || loc.status === "OPEN"))
            || (viewer === "LegalOfficer" && loc.status === "OPEN");
    }
}

export function canAdd(viewer: Viewer, loc: LocData) {
    return (viewer === "User" && (!loc.voidInfo && (loc.status === "DRAFT" || loc.status === "OPEN")))
        || (viewer === "LegalOfficer" && (!loc.voidInfo && loc.status === "OPEN"));
}

export function canPublish(viewer: Viewer, loc: LocData) {
    return viewer === 'LegalOfficer' && loc.status === "OPEN";
}

export interface LinkData {
    linkedLoc: LocData;
    linkDetailsPath: string;
}

export async function getLinkData(
    address: string | undefined,
    locsState: LocsState,
    link: MergedLink,
    detailsPath: (id: UUID, locType: LocType) => string,
    client: LogionClient,
): Promise<LinkData> {
    let linkedLoc: LocData | undefined;
    let linkedLocState: LocRequestState | PublicLoc | undefined = locsState.findByIdOrUndefined(link.id);
    if (!linkedLocState) {
        linkedLocState = await client.public.findLocById({ locId: link.id });
        if(linkedLocState) {
            linkedLoc = linkedLocState.data;
        }
    } else {
        linkedLoc = linkedLocState.data();
    }

    if(!linkedLoc) {
        throw new Error("Unable to locate linked LOC");
    }

    let linkDetailsPath: string;
    if (isGrantedAccess(address, linkedLoc)) {
        linkDetailsPath = detailsPath(linkedLoc.id, linkedLoc.locType);
    } else {
        linkDetailsPath = fullCertificateUrl(linkedLoc.id);
    }
    return {
        linkedLoc,
        linkDetailsPath,
    };
}
