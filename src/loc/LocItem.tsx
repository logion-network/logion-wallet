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
} from "@logion/client";
import { UUID, LocType, Fees, ValidAccountId, Hash } from "@logion/node-api";
import { useCallback } from "react";
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

export type LocItemType = 'Data' | 'Document' | 'Linked LOC';

export interface LinkData {
    readonly linkedLoc: LocData;
    readonly linkDetailsPath: string;
    readonly nature: string;
}

export interface MetadataData {
    readonly name?: string;
    readonly nameHash: Hash;
    readonly value: string;
}

export interface FileData {
    readonly hash: Hash;
    readonly fileName: string;
    readonly nature: string;
    readonly size: bigint;
    readonly storageFeePaidBy: string;
}

export interface CommonData {
    readonly timestamp: string | null;
    readonly type: LocItemType;
    readonly submitter?: ValidAccountId;
    readonly status: ItemStatus;
    readonly newItem: boolean;
    readonly template: boolean;
    readonly isSet?: boolean;
    readonly fees?: Fees;
    readonly reviewedOn?: string;
    readonly rejectReason?: string;
    readonly acknowledgedByOwner?: boolean;
    readonly acknowledgedByVerifiedIssuer?: boolean;
}

export abstract class LocItem implements CommonData {

    constructor(commonData: CommonData) {
        this.commonData = commonData;
    }

    protected commonData: CommonData;

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

    abstract title(): string;

    hasData() {
        return this.commonData.submitter !== undefined;
    }

    abstract metadataData(): MetadataData;

    abstract fileData(): FileData;

    abstract linkData(): LinkData;

    abstract publish(timestamp: string | null, fees?: Fees, storageFeePaidBy?: string): LocItem;

    get submitterOrThrow() {
        if(this.commonData.submitter) {
            return this.commonData.submitter;
        } else {
            throw new Error("Data not set");
        }
    }
}

export class MetadataItem extends LocItem {

    constructor(commonData: CommonData, metadataData?: MetadataData) {
        super(commonData);
        this._metadataData = metadataData;
    }

    private _metadataData?: MetadataData;

    override title() {
        return this._metadataData?.name || "-";
    }

    override hasData(): boolean {
        return super.hasData() && this._metadataData !== undefined;
    }

    metadataData(): MetadataData {
        if(this._metadataData) {
            return this._metadataData;
        } else {
            throw new Error("Data not set");
        }
    }

    fileData(): FileData {
        throw new Error("Method not implemented.");
    }

    linkData(): LinkData {
        throw new Error("Method not implemented.");
    }

    override publish(timestamp: string | null, fees?: Fees, _storageFeePaidBy?: string): LocItem {
        return new MetadataItem(
            {
                ...this.commonData,
                timestamp,
                fees,
            },
            this._metadataData,
        );
    }
}

export class FileItem extends LocItem {

    constructor(commonData: CommonData, fileData?: FileData) {
        super(commonData);
        this._fileData = fileData;
    }

    readonly _fileData?: FileData;

    override title() {
        return this._fileData?.nature || "-";
    }

    override hasData(): boolean {
        return super.hasData() && this._fileData !== undefined;
    }

    metadataData(): MetadataData {
        throw new Error("Method not implemented.");
    }

    fileData(): FileData {
        if(this._fileData) {
            return this._fileData;
        } else {
            throw new Error("Data not set");
        }
    }

    linkData(): LinkData {
        throw new Error("Method not implemented.");
    }

    override publish(timestamp: string | null, fees?: Fees, storageFeePaidBy?: string): LocItem {
        const newFileData = this._fileData && storageFeePaidBy ? {
            ...this._fileData,
            storageFeePaidBy,
        } : this._fileData;
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

export class LinkItem extends LocItem {

    constructor(commonData: CommonData, linkData?: LinkData) {
        super(commonData);
        this._linkData = linkData;
    }

    readonly _linkData?: LinkData;

    override title() {
        return this._linkData?.nature || "-";
    }

    override hasData(): boolean {
        return super.hasData() && this._linkData !== undefined;
    }

    metadataData(): MetadataData {
        throw new Error("Method not implemented.");
    }

    fileData(): FileData {
        throw new Error("Method not implemented.");
    }

    linkData(): LinkData {
        if(this._linkData) {
            return this._linkData;
        } else {
            throw new Error("Data not set");
        }
    }

    override publish(timestamp: string | null, fees?: Fees, _storageFeePaidBy?: string): LocItem {
        return new LinkItem(
            {
                ...this.commonData,
                timestamp,
                fees,
            },
            this._linkData,
        );
    }
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
                            fileName={ locItem.fileData().fileName }
                            downloader={ () => locState?.getFile(locItem.fileData().hash) }
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
            render: locItem => locItem.type === "Document" && locItem.hasData() ? <RestrictedDeliveryCell hash={ locItem.fileData().hash }/> : null,
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
            render: locItem => renderActions(locItem, loc.id),
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
                    documentClaimHistory={ loc?.locType === "Collection" && !locItem.template ? documentClaimHistory(viewer, loc, locItem.fileData().hash) : undefined }
                    otherFeesPaidByRequester={ loc?.requesterLocId === undefined }
                />
            }
            { locItem.type === 'Linked LOC' && <LocLinkDetails item={ locItem } /> }
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
                    nameHash: item.metadataData().nameHash,
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
                    hash: item.fileData().hash,
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
                // TODO use current.deleteLink(...)
                return current.legalOfficer.deleteLink({
                    target: item.linkData().linkedLoc.id,
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
            && (item.status === "DRAFT" || (item.status === "REVIEW_ACCEPTED" && item.submitter?.type === "Polkadot") || item.status === "REVIEW_REJECTED");
}

export function canAdd(viewer: Viewer, loc: LocData) {
    return (viewer === "User" && (!loc.voidInfo && (loc.status === "DRAFT" || loc.status === "OPEN")))
        || (viewer === "LegalOfficer" && (!loc.voidInfo && loc.status === "OPEN"));
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
    return viewer === "LegalOfficer" && item.status === "REVIEW_PENDING" && loc.status === "OPEN";
}

export async function getLinkData(
    address: string | undefined,
    locsState: LocsState,
    link: MergedLink,
    detailsPath: (id: UUID, locType: LocType) => string,
    client: LogionClient,
): Promise<LinkData> {
    let linkedLoc: LocData | undefined;
    const targetId = new UUID(link.target);
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
            if(current instanceof EditableRequest) {
                if(locItem.type === "Data") {
                    return current.requestMetadataReview(locItem.metadataData().nameHash);
                } else if(locItem.type === "Document") {
                    return current.requestFileReview(locItem.fileData().hash);
                // } // TODO: uncomment
                // else if(locItem.type === "Linked LOC") {
                //     return current.requestLinkReview(locItem.linkData().linkedLoc.id);
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
            if(current instanceof EditableRequest) {
                if(locItem.type === "Data") {
                    return current.legalOfficer.reviewMetadata({
                        nameHash: locItem.metadataData().nameHash,
                        decision,
                        rejectReason
                    });
                } else if(locItem.type === "Document") {
                    return current.legalOfficer.reviewFile({
                        hash: locItem.fileData().hash,
                        decision,
                        rejectReason
                    });
                // } else if(locItem.type === "Linked LOC") { // TODO: uncomment
                //     return current.legalOfficer.reviewLink({
                //         target: locItem.linkData().linkedLoc.id,
                //         decision,
                //         rejectReason
                //     });
                } else {
                    return current;
                }
            } else {
                return current;
            }
        });
    }, [ mutateLocState ]);
}
