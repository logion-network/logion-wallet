import Table, { Cell, DateTimeCell, EmptyTableMessage, ActionCell } from "../../common/Table";
import StatusCell from "../../common/StatusCell";
import LegalOfficerName from "../../common/LegalOfficerNameCell";
import { useLocContext } from "./LocContext";
import ButtonGroup from "../../common/ButtonGroup";
import Button from "../../common/Button";
import React from "react";
import LocPublicDataDetails from "./LocPublicDataDetails";
import LocPublishPublicDataButton from "./LocPublishPublicDataButton";
import { POLKADOT } from "../../common/ColorTheme";
import { Child } from "../../common/types/Helpers";
import LocPrivateFileDetails from "./LocPrivateFileDetails";
import LocPublishPrivateFileButton from "./LocPublishPrivateFileButton";
import ViewFileButton from "../../common/ViewFileButton";
import { AxiosInstance } from "axios";
import { getFile } from "../Model";
import { LocItem } from "./types";
import LocLinkDetails from "./LocLinkDetails";
import LocPublishLinkButton from "./LocPublishLinkButton";

export interface Props {
    matchedHash?: string;
}

export default function LocItems(props: Props) {

    const { locId, locItems, deleteMetadata, deleteLink, deleteFile } = useLocContext();

    function renderDetails(locItem: LocItem): Child {
        return (
            <>
                { locItem.type === 'Data' && <LocPublicDataDetails item={ locItem } label={ locItem.name } /> }
                { locItem.type === 'Document' && <LocPrivateFileDetails item={ locItem } /> }
                { locItem.type === 'Linked LOC' && <LocLinkDetails item={ locItem } /> }
            </>
        )
    }

    interface DeleteButtonProps {
        locItem:LocItem
        action: (locItem:LocItem) => void
    }

    function DeleteButton(props: DeleteButtonProps) {
        const { locItem, action } = props
        return (
            <Button
                variant="danger"
                onClick={ () => action(locItem) }
                data-testid={ `remove-${ locItem.type }-${ locItem.name }` }
            >
                X
            </Button>
        );
    }

    function renderActions(locItem: LocItem): Child {

        return (
            <ActionCell>
                { locItem.type === 'Data' && <ButtonGroup>
                    <LocPublishPublicDataButton locItem={ locItem } />
                    <DeleteButton locItem={ locItem } action={ deleteMetadata! } />
                </ButtonGroup> }
                { locItem.type === 'Linked LOC' && <ButtonGroup>
                    <LocPublishLinkButton locItem={ locItem } />
                    <DeleteButton locItem={ locItem } action={ deleteLink! } />
                </ButtonGroup> }
                { locItem.type === 'Document' && <ButtonGroup>
                    <LocPublishPrivateFileButton locItem={ locItem } />
                    <DeleteButton locItem={ locItem } action={ deleteFile! } />
                </ButtonGroup> }
            </ActionCell>)
    }

    function renderViewButton(locItem: LocItem): Child {
        if (locItem.type === 'Document') {
            return (
                <>
                    <ActionCell>
                        <ViewFileButton
                            nodeOwner={ locItem.submitter }
                            fileName={ locItem.name }
                            downloader={ (axios: AxiosInstance) => getFile(axios, {
                                locId: locId.toString(),
                                hash: locItem.value
                            }) } />
                    </ActionCell>
                </>
            )
        } else {
            return null
        }
    }

    return (
        <Table
            data={ locItems }
            columns={ [
                {
                    header: "Name",
                    render: locItem => <Cell content={ locItem.name } />,
                    renderDetails: locItem => renderDetails(locItem),
                    align: "left",
                    width: "250px"
                },
                {
                    header: "Timestamp",
                    render: locItem => <DateTimeCell
                        dateTime={ locItem.timestamp }
                        spinner={ locItem.status === 'PUBLISHED' } />,
                    width: "200px"
                },
                {
                    header: "Type",
                    render: locItem => <Cell content={ locItem.type } />,
                    width: "150px"
                },
                {
                    header: "Submitted by",
                    render: locItem => <LegalOfficerName address={ locItem.submitter } />
                },
                {
                    header: "",
                    render: locItem => renderViewButton(locItem),
                    width: "150px"
                },
                {
                    header: "",
                    render: locItem => {
                        if (locItem.status === 'DRAFT') {
                            return renderActions(locItem)
                        } else {
                            return (<StatusCell text={ locItem.status } color={ POLKADOT } />)
                        }
                    }
                }
            ] }
            renderEmpty={ () => <EmptyTableMessage>No public data nor private documents
                yet</EmptyTableMessage> }
            rowStyle={ (item, index?) => (item.type === "Document" && item.value === props.matchedHash) ? "matched" : "" }
        />
    )
}
