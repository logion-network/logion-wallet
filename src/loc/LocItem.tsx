import {
    LogionClient,
    LocRequestState,
    LocData,
    LocsState,
    EditableRequest,
    MergedLink,
    PublicLoc,
    ItemStatus,
    ReviewResult,
    HashString,
    OpenLoc,
    PendingRequest,
} from "@logion/client";
import { UUID, LocType, Fees, ValidAccountId, Hash } from "@logion/node-api";
import { ReactNode, useCallback } from "react";
import { CallCallback } from "src/ClientExtrinsicSubmitter";
import { Viewer } from "src/common/CommonContext";
import { isGrantedAccess } from "src/common/Model";
import { Rules } from "src/common/Responsive";
import SubmitterName from "src/common/SubmitterName";
import { Cell, Column, DateTimeCell } from "src/common/Table";
import { Child } from "src/common/types/Helpers";
import ViewFileButton from "src/common/ViewFileButton";
import { documentClaimHistoryPath } from "src/legal-officer/LegalOfficerPaths";
import { fullCertificateUrl } from "src/PublicPaths";
import { documentClaimHistoryPath as userDocumentClaimHistoryPath } from "src/wallet-user/UserRouter";
import LocLinkDetails from "./LocLinkDetails";
import LocPrivateFileDetails from "./LocPrivateFileDetails";
import LocPublicDataDetails from "./LocPublicDataDetails";
import RestrictedDeliveryCell from "./RestricedDeliveryCell";
import { ContributionMode } from "./types";
import ReviewStatusCell from "./ReviewStatusCell";
import HelpTooltip from "src/components/helptooltip/HelpTooltip";
import { DateTime } from "luxon";

export type LocItemType = 'Data' | 'Document' | 'Linked LOC';

export interface LinkData {
    readonly linkedLoc: LocData;
    readonly linkDetailsPath: string;
    readonly nature: HashString;
}

export interface MetadataData {
    readonly name: HashString;
    readonly value: HashString;
}

export interface FileData {
    readonly hash: Hash;
    readonly fileName: string;
    readonly nature: HashString;
    readonly size: bigint;
    readonly storageFeePaidBy: string;
}

export interface CommonData {
    readonly timestamp: DateTime | null;
    readonly type: LocItemType;
    readonly submitter?: ValidAccountId;
    readonly status: ItemStatus;
    readonly newItem: boolean;
    readonly template: boolean;
    readonly isSet?: boolean;
    readonly fees?: Fees;
    readonly reviewedOn?: DateTime;
    readonly rejectReason?: string;
    readonly acknowledgedByOwner?: boolean;
    readonly acknowledgedByVerifiedIssuer?: boolean;
    readonly defaultTitle?: string;
}

abstract class AbstractLocItem<T> implements CommonData {

    constructor(commonData: CommonData, data?: T) {
        this.commonData = commonData;
        this._data = data;
    }

    protected commonData: CommonData;
    private readonly _data?: T;

    get timestamp() {
        return this.commonData.timestamp;
    }

    get type() {
        return this.commonData.type;
    }

    get submitter() {
        return this.commonData.submitter;
    }

    get status() {
        return this.commonData.status;
    }

    get newItem() {
        return this.commonData.newItem;
    }

    get template() {
        return this.commonData.template;
    }

    get isSet() {
        return this.commonData.isSet;
    }

    get fees() {
        return this.commonData.fees;
    }

    get reviewedOn() {
        return this.commonData.reviewedOn;
    }

    get rejectReason() {
        return this.commonData.rejectReason;
    }

    get acknowledgedByOwner() {
        return this.commonData.acknowledgedByOwner;
    }

    get acknowledgedByVerifiedIssuer() {
        return this.commonData.acknowledgedByVerifiedIssuer;
    }

    get defaultTitle(): string  {
        return this.commonData.defaultTitle || this.commonData.type;
    }

    isPublishedOrAcknowledged(): boolean {
        return this.commonData.status === "PUBLISHED" || this.commonData.status === "ACKNOWLEDGED"
    }

    abstract title(): string;

    hasData(): boolean {
        return this.commonData.submitter !== undefined && this._data !== undefined;
    }

    data(): T {
        if(this._data) {
            return this._data;
        } else {
            throw new Error("Data not set");
        }
    }

    as<U>(): U {
        return this._data as U;
    }

    abstract publish(timestamp: DateTime | null, fees?: Fees, storageFeePaidBy?: string): AbstractLocItem<T>;

    get submitterOrThrow() {
        if(this.commonData.submitter) {
            return this.commonData.submitter;
        } else {
            throw new Error("Data not set");
        }
    }
}

export class MetadataItem extends AbstractLocItem<MetadataData> {

    static TYPE: LocItemType = "Data";

    override title() {
        if (this.hasData()) {
            return this.data().name.value || "-";
        } else {
            return this.defaultTitle;
        }
    }

    override publish(timestamp: DateTime | null, fees?: Fees, _storageFeePaidBy?: string): MetadataItem {
        return new MetadataItem(
            {
                ...this.commonData,
                timestamp,
                fees,
            },
            this.data(),
        );
    }
}

export class FileItem extends AbstractLocItem<FileData> {

    override title() {
        if (this.hasData()) {
            return this.data().nature.value || "-";
        } else {
            return this.defaultTitle
        }
    }

    override publish(timestamp: DateTime | null, fees?: Fees, storageFeePaidBy?: string): FileItem {
        const newFileData = this.data() && storageFeePaidBy ? {
            ...this.data(),
            storageFeePaidBy,
        } : this.data();
        return new FileItem(
            {
                ...this.commonData,
                timestamp,
                fees,
            },
            newFileData,
        );
    }
}

export class LinkItem extends AbstractLocItem<LinkData> {

    override title() {
        if (this.hasData()) {
            return this.data().nature.value || "-";
        } else {
            return this.defaultTitle;
        }
    }

    override publish(timestamp: DateTime | null, fees?: Fees, _storageFeePaidBy?: string): LinkItem {
        return new LinkItem(
            {
                ...this.commonData,
                timestamp,
                fees,
            },
            this.data(),
        );
    }
}

export type LocItem = LinkItem | MetadataItem | FileItem;

export enum PublishStatus {
    NONE,
    START,
    PUBLISHING,
    DONE
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
    renderActions: (locItem: LocItem) => ReactNode,
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
            render: locItem => <Cell content={ locItem.title() } overflowing tooltipId={`${loc.id}-name-tooltip`}/>,
            renderDetails: locItem => renderDetails(loc, locItem, viewer),
            detailsExpanded: locItem => locItem.newItem || (locItem.template && (viewer !== "LegalOfficer" || (locItem.status !== "PUBLISHED" && locItem.status !== "ACKNOWLEDGED"))),
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
                        locItem.type === 'Document' &&
                        canViewFile(viewer, currentAddress, locItem, contributionMode) &&
                        <ViewFileButton
                            nodeOwner={ loc.ownerAddress }
                            fileName={ locItem.as<FileData>().fileName }
                            downloader={ () => locState?.getFile(locItem.as<FileData>().hash) }
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
            render: locItem => locItem.type === "Document" && locItem.hasData() ? <RestrictedDeliveryCell hash={ locItem.as<FileData>().hash }/> : null,
            width: "130px",
        });
    }

    columns = columns.concat([
        {
            header: <>Reviewed <HelpTooltip id="reviewed" help="You confirm that the content you submitted for review by the Legal Officer is good to be recorded by the logion infrastructure with regard to the LOC context and to the specific content that will be publicly available after the recording (eg: GDPR)."/></>,
            render: locItem => <ReviewStatusCell locItem={ locItem } />,
        },
        {
            header: "",
            render: locItem => renderActions(locItem),
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
            { locItem.type === 'Data' && <LocPublicDataDetails item={ locItem as MetadataItem } /> }
            {
                locItem.type === 'Document' &&
                <LocPrivateFileDetails
                    item={ locItem as FileItem }
                    documentClaimHistory={ loc?.locType === "Collection" && !locItem.template ? documentClaimHistory(viewer, loc, locItem.as<FileData>().hash) : undefined }
                    otherFeesPaidByRequester={ loc?.requesterLocId === undefined }
                />
            }
            { locItem.type === 'Linked LOC' && <LocLinkDetails item={ locItem as LinkItem } /> }
        </>
    )
}

function canViewFile(viewer: Viewer, address: string | undefined, item: LocItem, contributionMode?: ContributionMode): boolean {
    return item.hasData() && (contributionMode !== 'VerifiedIssuer' || item.submitterOrThrow.address === address) && (viewer === "User" || item.status !== "DRAFT");
}

export function documentClaimHistory(viewer: Viewer, loc: LocData | null, hash: Hash) {
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
                    nameHash: item.as<MetadataData>().name.hash,
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
                    hash: item.as<FileData>().hash,
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
                return current.deleteLink({
                    target: item.as<LinkData>().linkedLoc.id,
                });
            } else {
                return current;
            }
        });
    }, [ mutateLocState ]);
}

export function canDelete(account: ValidAccountId | undefined, item: LocItem, viewer: Viewer, loc: LocData): boolean {
    return item.submitter?.address === account?.address && item.submitter?.type === account?.type
            && (loc.status === "DRAFT" || loc.status === "OPEN")
            && (item.status === "DRAFT" || item.status === "REVIEW_REJECTED");
}

export function canAdd(viewer: Viewer, loc: LocData) {
    return (viewer === "User" && (!loc.voidInfo && (loc.status === "DRAFT" || loc.status === "OPEN")))
        || (viewer === "LegalOfficer"
            && (!loc.voidInfo && loc.status === "OPEN")
            && ( loc.requesterAddress === undefined || loc.requesterAddress.type !== "Polkadot"));
}

type ActorType = "Owner" | ContributionMode;

function getActorType(viewer: Viewer, contributionMode?: ContributionMode): ActorType {
    if (viewer === "LegalOfficer") {
        return "Owner"
    } else {
        return contributionMode!
    }
}

function getSubmitterType(loc: LocData, item: LocItem): ActorType {
    const submittedByOwner = item?.submitter?.address === loc.ownerAddress && item?.submitter?.type === "Polkadot";
    const submittedByRequester = loc.requesterAddress !== undefined && item.submitter !== undefined && loc.requesterAddress.equals(item.submitter);

    if (submittedByOwner) {
        return "Owner";
    } else if (submittedByRequester) {
        return "Requester";
    } else {
        return "VerifiedIssuer";
    }
}

export function canPublish(viewer: Viewer, loc: LocData, item: LocItem, contributionMode?: ContributionMode): boolean {

    const actorType = getActorType(viewer, contributionMode);
    if (actorType === "VerifiedIssuer") {
        return false;
    }

    const submitterType = getSubmitterType(loc, item);

    const publishedByOwner = submitterType === "Owner" || loc.requesterAddress === undefined || loc.requesterAddress.type !== "Polkadot";

    const publishable = item.status === "REVIEW_ACCEPTED";

    return publishable
        && loc.status === "OPEN" && !loc.voidInfo
        && (
            (actorType === "Owner" && publishedByOwner) ||
            (actorType === "Requester" && !publishedByOwner)
        );
}

export function canAcknowledge(viewer: Viewer, loc: LocData, item: LocItem, contributionMode?: ContributionMode): boolean {

    const actorType = getActorType(viewer, contributionMode);
    if (actorType === "Requester") {
        return false;
    }

    const submitterType = getSubmitterType(loc, item);

    const acknowledgeable = item.status === "PUBLISHED";

    return acknowledgeable
        && loc.status === "OPEN" && !loc.voidInfo
        && (
            (submitterType === "VerifiedIssuer" && actorType === "VerifiedIssuer" && item.acknowledgedByVerifiedIssuer !== undefined && !item.acknowledgedByVerifiedIssuer)
            || (actorType === "Owner" && item.acknowledgedByOwner !== undefined && !item.acknowledgedByOwner)
        )
}

export function canRequestReview(viewer: Viewer, loc: LocData, item: LocItem) {
    return viewer === "User" && item.status === "DRAFT" && loc.status === "OPEN";
}

export function canReview(viewer: Viewer, loc: LocData, item: LocItem) {
    return viewer === "LegalOfficer" && item.status === "REVIEW_PENDING" && (loc.status === "REVIEW_PENDING" || loc.status === "OPEN");
}

export async function getLinkData(
    address: string | undefined,
    locsState: LocsState,
    link: MergedLink,
    detailsPath: (id: UUID, locType: LocType) => string,
    client: LogionClient,
): Promise<LinkData> {
    let linkedLoc: LocData | undefined;
    const targetId = link.target;
    let linkedLocState: LocRequestState | PublicLoc | undefined = locsState.findByIdOrUndefined(targetId);
    if (!linkedLocState) {
        linkedLocState = await client.public.findLocById({ locId: targetId });
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
        nature: link.nature,
    };
}

export function useRequestReviewCallback(mutateLocState: (mutator: (current: LocRequestState) => Promise<LocRequestState | LocsState>) => Promise<void>) {
    return useCallback(async (locItem: LocItem) => {
        mutateLocState(async current => {
            if (current instanceof EditableRequest) {
                if (locItem.type === "Data") {
                    return current.requestMetadataReview({ nameHash: locItem.as<MetadataData>().name.hash });
                } else if (locItem.type === "Document") {
                    return current.requestFileReview({ hash: locItem.as<FileData>().hash });
                } else if (locItem.type === "Linked LOC") {
                    return current.requestLinkReview({ target: locItem.as<LinkData>().linkedLoc.id });
                } else {
                    return current;
                }
            } else {
                return current;
            }
        });
    }, [ mutateLocState ]);
}

export function useReviewCallback(mutateLocState: (mutator: (current: LocRequestState) => Promise<LocRequestState | LocsState>) => Promise<void>) {
    return useCallback(async (locItem: LocItem, decision: ReviewResult, rejectReason?: string) => {
        mutateLocState(async current => {
            if(current instanceof OpenLoc || current instanceof PendingRequest) {
                if(locItem.type === "Data") {
                    return current.legalOfficer.reviewMetadata({
                        nameHash: locItem.as<MetadataData>().name.hash,
                        decision,
                        rejectReason
                    });
                } else if(locItem.type === "Document") {
                    return current.legalOfficer.reviewFile({
                        hash: locItem.as<FileData>().hash,
                        decision,
                        rejectReason
                    });
                } else if(locItem.type === "Linked LOC") {
                    return current.legalOfficer.reviewLink({
                        target: locItem.as<LinkData>().linkedLoc.id,
                        decision,
                        rejectReason
                    });
                } else {
                    return current;
                }
            } else {
                return current;
            }
        });
    }, [ mutateLocState ]);
}
