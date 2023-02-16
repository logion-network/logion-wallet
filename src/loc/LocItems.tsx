import { LocData, EditableRequest } from "@logion/client";
import { AxiosInstance } from "axios";

import Table, { Cell, DateTimeCell, EmptyTableMessage, ActionCell, Column } from "../common/Table";
import StatusCell from "../common/StatusCell";
import ButtonGroup from "../common/ButtonGroup";
import Button from "../common/Button";
import { POLKADOT } from "../common/ColorTheme";
import { Child } from "../common/types/Helpers";
import ViewFileButton from "../common/ViewFileButton";
import Icon from "../common/Icon";
import { useResponsiveContext } from "../common/Responsive";
import SubmitterName from "../common/SubmitterName";
import { useLogionChain } from "../logion-chain";

import { getFile } from "./Model";
import { LocItem, ContributionMode } from "./types";
import LocLinkDetails from "./LocLinkDetails";
import LocPublishLinkButton from "./LocPublishLinkButton";
import LocPrivateFileDetails from "./LocPrivateFileDetails";
import LocPublishPrivateFileButton from "./LocPublishPrivateFileButton";
import LocPublishPublicDataButton from "./LocPublishPublicDataButton";
import LocPublicDataDetails from "./LocPublicDataDetails";
import { deleteLink } from "../legal-officer/client";

import './LocItems.css';
import { Viewer } from "src/common/CommonContext";
import { useLocContext } from "./LocContext";
import { useCallback } from "react";
import RestrictedDeliveryCell from "./RestricedDeliveryCell";
import { documentClaimHistoryPath } from "src/legal-officer/LegalOfficerPaths";
import { documentClaimHistoryPath as userDocumentClaimHistoryPath } from "src/wallet-user/UserRouter";

export interface LocItemsProps {
    matchedHash?: string;
    viewer: Viewer;
    contributionMode?: ContributionMode;
}

export function LocItems(props: LocItemsProps) {
    const { mutateLocState, loc, locItems } = useLocContext();
    const { accounts } = useLogionChain();

    const { width } = useResponsiveContext();

    const deleteMetadata = useCallback(async (item: LocItem) => {
        await mutateLocState(async current => {
            if(current instanceof EditableRequest) {
                return current.deleteMetadata({
                    name: item.name,
                });
            } else {
                return current;
            }
        });
    }, [ mutateLocState ]);

    const deleteFile = useCallback(async (item: LocItem) => {
        await mutateLocState(async current => {
            if(current instanceof EditableRequest) {
                return current.deleteFile({
                    hash: item.value,
                });
            } else {
                return current;
            }
        });
    }, [ mutateLocState ]);

    const deleteLinkCallback = useCallback(async (item: LocItem) => {
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

    if(!loc) {
        return null;
    }

    function renderDetails(locItem: LocItem): Child {
        return (
            <>
                { locItem.type === 'Data' && <LocPublicDataDetails item={ locItem } /> }
                { locItem.type === 'Document' && <LocPrivateFileDetails item={ locItem } documentClaimHistory={ documentClaimHistory(props.viewer, loc, locItem.value)} /> }
                { locItem.type === 'Linked LOC' && <LocLinkDetails item={ locItem } /> }
            </>
        )
    }

    interface DeleteButtonProps {
        locItem: LocItem
        action: (locItem: LocItem) => void
    }

    function DeleteButton(props: DeleteButtonProps) {
        const { locItem, action } = props
        return (
            <Button
                variant="danger-flat"
                onClick={ () => action(locItem) }
                data-testid={ `remove-${ locItem.type }-${ locItem.name }` }
            >
                <Icon icon={ { id: 'trash' } } />
            </Button>
        );
    }

    function renderActions(locItem: LocItem): Child {

        return (
            <ActionCell>
                { locItem.type === 'Data' && <ButtonGroup>
                    { props.viewer === 'LegalOfficer' && loc!.status === "OPEN" && <LocPublishPublicDataButton locItem={ locItem } /> }
                    { canDelete(accounts?.current?.address, locItem, props.viewer, loc!) &&
                        <DeleteButton locItem={ locItem } action={ deleteMetadata } /> }
                </ButtonGroup> }
                { locItem.type === 'Linked LOC' && <ButtonGroup>
                    { props.viewer === 'LegalOfficer' && <LocPublishLinkButton locItem={ locItem } /> }
                    { canDelete(accounts?.current?.address, locItem, props.viewer, loc!) &&
                        <DeleteButton locItem={ locItem } action={ deleteLinkCallback } /> }
                </ButtonGroup> }
                { locItem.type === 'Document' && <ButtonGroup>
                    { props.viewer === 'LegalOfficer' && loc!.status === "OPEN" && <LocPublishPrivateFileButton locItem={ locItem } /> }
                    { canDelete(accounts?.current?.address, locItem, props.viewer, loc!) &&
                        <DeleteButton locItem={ locItem } action={ deleteFile } /> }
                </ButtonGroup> }
            </ActionCell>)
    }

    if (locItems.length <= 0 && !loc.closed) {
        return (
            <div className="LocItems empty-loc">
                <img alt="empty loc" src={ process.env.PUBLIC_URL + "/assets/empty-loc.svg" } />
                <p className="primary">This LOC is empty.</p>
                <p className="secondary">You can add public data and/or confidential documents.</p>
            </div>
        );
    } else {
        let columns: Column<LocItem>[] = [
            {
                header: "Name",
                render: locItem => <Cell content={ locItem.name } overflowing tooltipId={`${loc.id}-name-tooltip`}/>,
                renderDetails: locItem => renderDetails(locItem),
                detailsExpanded: locItem => locItem.newItem,
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
                        locItem.type === 'Document' && canViewFile(accounts?.current?.address, locItem, props.contributionMode) &&
                        <ViewFileButton
                            nodeOwner={ loc.ownerAddress }
                            fileName={ locItem.name }
                            downloader={ (axios: AxiosInstance) => getFile(axios, {
                                locId: loc.id.toString(),
                                hash: locItem.value
                            }) }
                        />
                    }
                    </> } />,
                width: "160px",
                align: "left"
            },
            {
                header: "Submitted by",
                render: locItem => <SubmitterName loc={ loc } submitter={ locItem.submitter } />
            }
        ];

        if(loc.locType === "Collection" && props.viewer === "LegalOfficer") {
            columns.push({
                header: "Restricted Delivery?",
                render: locItem => locItem.type === "Document" ? <RestrictedDeliveryCell hash={ locItem.value }/> : null,
                width: "130px",
            });
        }

        columns = columns.concat([
            {
                header: "",
                render: locItem => {
                    if (locItem.status === 'DRAFT') {
                        return renderActions(locItem)
                    } else {
                        return (
                            <StatusCell icon={ { id: 'published' } } text="Published" color={ POLKADOT } />)
                    }
                },
                width: width({
                    onSmallScreen: props.viewer === "LegalOfficer" ? '345px' : '145px',
                    otherwise: '400px'
                }),
            }
        ]);
        return (
            <div className="LocItems">
                <Table
                    data={ locItems }
                    columns={ columns }
                    renderEmpty={ () => <EmptyTableMessage>No public data nor private documents</EmptyTableMessage> }
                    rowStyle={ item => (item.type === "Document" && item.value === props.matchedHash) ? "matched" : "" }
                />
            </div>
        );
    }
}

function canDelete(address: string | undefined, item: LocItem, viewer: Viewer, loc: LocData): boolean {
    if (item.type === "Linked LOC") {
        return viewer === "LegalOfficer";
    } else {
        return (viewer === "User" && item.submitter === address && (loc.status === "DRAFT" || loc.status === "OPEN"))
            || (viewer === "LegalOfficer" && loc.status === "OPEN");
    }
}

function canViewFile(address: string | undefined, item: LocItem, contributionMode?: ContributionMode): boolean {
    return (contributionMode !== 'VTP' || item.submitter === address);
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
